#!/usr/bin/env python3
"""
GLM-5.2 Model Integration using NVIDIA Integrate API and OpenAI SDK.

This script implements a production-ready conversational agent utilizing the
z-ai/glm-5.2 model hosted on NVIDIA NIM. It features:
- Conversation history / memory persistence
- Custom system prompts
- Tool (function) calling support (local tools example)
- API error handling with exponential backoff retry logic
- Live token streaming for both standard responses and function results
- Clean shutdown handlers for SIGINT/Ctrl+C
"""

import os
import sys
import time
import json
import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

# Load environment variables from .env file
load_dotenv()

# Configuration Settings
NVIDIA_API_BASE_URL = "https://integrate.api.nvidia.com/v1"
MODEL_NAME = "z-ai/glm-5.2"
TEMPERATURE = 1.0
TOP_P = 1.0
MAX_TOKENS = 16384
SEED = 42

# Default System Prompt
SYSTEM_PROMPT = (
    "You are a helpful, precise, and expert AI assistant powered by the "
    "GLM-5.2 model running on the NVIDIA Integrate API. You have access to tools "
    "to check the current time and perform calculations."
)


# ==========================================
# 🛠️ Define Local Tools / Functions
# ==========================================

def get_current_time() -> str:
    """Returns the current local time."""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def calculate_math(expression: str) -> str:
    """Evaluates simple mathematical expressions safely."""
    try:
        # Restrict builtins to prevent arbitrary code execution
        allowed_chars = set("0123456789+-*/(). ")
        if not set(expression).issubset(allowed_chars):
            return "Error: Invalid characters in expression."
        # Safe evaluation
        result = eval(expression, {"__builtins__": None}, {})
        return str(result)
    except Exception as e:
        return f"Error evaluating expression: {str(e)}"


# Map function names to their python functions
AVAILABLE_TOOLS = {
    "get_current_time": get_current_time,
    "calculate_math": calculate_math
}

# Define the JSON Schemas for tools
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Get the current local system date and time.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_math",
            "description": "Evaluate simple mathematical expressions (addition, subtraction, multiplication, division).",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "The math expression to evaluate, e.g., '2 + 2' or '(12 * 4) / 2'."
                    }
                },
                "required": ["expression"]
            }
        }
    }
]


# ==========================================
# 🔌 Client and API Utilities
# ==========================================

def get_client() -> OpenAI:
    """
    Initializes and returns the OpenAI client configured for the NVIDIA API.
    """
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        print("Error: NVIDIA_API_KEY environment variable is not set.", file=sys.stderr)
        print("Please check your .env file or export the variable.", file=sys.stderr)
        sys.exit(1)

    return OpenAI(
        base_url=NVIDIA_API_BASE_URL,
        api_key=api_key
    )


def call_chat_with_retry(client: OpenAI, messages: List[Dict[str, Any]], stream: bool = True, use_tools: bool = True) -> Any:
    """
    Executes a chat completion request with exponential backoff retry logic.
    """
    max_retries = 3
    base_delay = 2.0

    kwargs = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": TEMPERATURE,
        "top_p": TOP_P,
        "max_tokens": MAX_TOKENS,
        "seed": SEED,
        "stream": stream
    }

    if use_tools:
        kwargs["tools"] = TOOL_SCHEMAS

    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(**kwargs)
        except OpenAIError as e:
            if attempt == max_retries - 1:
                raise e
            delay = base_delay * (2 ** attempt)
            print(f"\n[Warning] API request failed: {e}. Retrying in {delay:.1f}s...", file=sys.stderr)
            time.sleep(delay)


# ==========================================
# 💬 Core Interaction Engine
# ==========================================

def handle_chat_turn(client: OpenAI, history: List[Dict[str, Any]], user_prompt: str) -> None:
    """
    Appends the user prompt, triggers LLM response (handling streaming and tool invocations),
    and appends assistant replies back into history.
    """
    history.append({"role": "user", "content": user_prompt})

    print("\nAssistant: ", end="", flush=True)

    try:
        # Call model with retry logic
        response_stream = call_chat_with_retry(client, history, stream=True)

        tool_calls_accumulator = []
        assistant_content_chunks = []

        # Process stream
        for chunk in response_stream:
            # Check if index has choices
            if not chunk.choices:
                continue

            delta = chunk.choices[0].delta

            # Accumulate text content
            if delta.content:
                print(delta.content, end="", flush=True)
                assistant_content_chunks.append(delta.content)

            # Accumulate tool calls if model wants to run functions
            if delta.tool_calls:
                for tc in delta.tool_calls:
                    idx = tc.index
                    # Grow list if we encounter a new tool call index
                    while len(tool_calls_accumulator) <= idx:
                        tool_calls_accumulator.append({
                            "id": "",
                            "type": "function",
                            "function": {"name": "", "arguments": ""}
                        })
                    
                    if tc.id:
                        tool_calls_accumulator[idx]["id"] = tc.id
                    if tc.function:
                        if tc.function.name:
                            tool_calls_accumulator[idx]["function"]["name"] = tc.function.name
                        if tc.function.arguments:
                            tool_calls_accumulator[idx]["function"]["arguments"] += tc.function.arguments

        print()  # Final newline for print streaming

        assistant_text = "".join(assistant_content_chunks)

        # Build assistant message object
        assistant_message = {"role": "assistant"}
        if assistant_text:
            assistant_message["content"] = assistant_text

        # If tools were invoked
        if tool_calls_accumulator:
            # Format tool_calls field correctly for history
            assistant_message["tool_calls"] = tool_calls_accumulator
            history.append(assistant_message)

            # Execute each function call
            for tc in tool_calls_accumulator:
                func_name = tc["function"]["name"]
                func_args_str = tc["function"]["arguments"]
                call_id = tc["id"]

                print(f"[Tool Invoke] Running {func_name}({func_args_str})...")

                result = "Error: Tool not found."
                if func_name in AVAILABLE_TOOLS:
                    try:
                        # Parse args if present
                        if func_args_str:
                            args = json.loads(func_args_str)
                            result = AVAILABLE_TOOLS[func_name](**args)
                        else:
                            result = AVAILABLE_TOOLS[func_name]()
                    except Exception as err:
                        result = f"Error executing tool: {str(err)}"

                print(f"[Tool Response] Result: {result}")

                # Append tool execution result back to history
                history.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "name": func_name,
                    "content": result
                })

            # Call assistant again to synthesize response using tool outputs
            handle_chat_turn_resume(client, history)
        else:
            # Just append text response to history
            history.append(assistant_message)

    except OpenAIError as e:
        print(f"\nAPI Error encountered: {e}", file=sys.stderr)
        # Pop the user message if it failed to keep history clean
        history.pop()


def handle_chat_turn_resume(client: OpenAI, history: List[Dict[str, Any]]) -> None:
    """
    Resumes standard generation stream after tool response is added to history.
    """
    print("Assistant (synthesized): ", end="", flush=True)

    try:
        # Disable tool-recursion on resume to prevent infinite loops
        response_stream = call_chat_with_retry(client, history, stream=True, use_tools=False)
        assistant_content_chunks = []

        for chunk in response_stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta
            if delta.content:
                print(delta.content, end="", flush=True)
                assistant_content_chunks.append(delta.content)
        print()

        assistant_text = "".join(assistant_content_chunks)
        history.append({"role": "assistant", "content": assistant_text})

    except OpenAIError as e:
        print(f"\nAPI Error encountered: {e}", file=sys.stderr)


# ==========================================
# 🚀 Entrypoint
# ==========================================

def main():
    print("Initializing NVIDIA client...")
    client = get_client()

    # Initialize conversation history with system prompt
    history = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    print("\n=======================================================")
    print(f" GLM-5.2 Agent Active (NVIDIA Integrate API)")
    print("=======================================================")
    print("Commands: 'exit' or 'quit' to close. 'clear' to reset history.")
    print("Sample tools available: 'get_current_time', 'calculate_math'.")
    print("Press Ctrl+C to exit cleanly.")
    print("-------------------------------------------------------")

    try:
        while True:
            try:
                user_input = input("\nYou: ").strip()
                if not user_input:
                    continue
                if user_input.lower() in ("exit", "quit"):
                    print("Goodbye!")
                    break
                if user_input.lower() == "clear":
                    history = [{"role": "system", "content": SYSTEM_PROMPT}]
                    print("[System] Conversation history cleared.")
                    continue

                handle_chat_turn(client, history, user_input)

            except EOFError:
                print("\nGoodbye!")
                break
    except KeyboardInterrupt:
        print("\nExit request detected. Goodbye!")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)


if __name__ == "__main__":
    main()
