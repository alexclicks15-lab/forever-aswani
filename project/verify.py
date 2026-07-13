#!/usr/bin/env python3
"""
End-to-End Test and Verification Script for GLM-5.2 Integration.
Runs functional checks for:
1. API connection
2. Streaming responses
3. Tool calling (Function calling execution)
4. Conversation memory
5. Retry/backoff logic
"""

import os
import sys
import json
import time
from typing import List, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

# Load env file
load_dotenv()

# Test results tracker
RESULTS = {
    "API connection": "FAIL",
    "Streaming": "FAIL",
    "Tool calling": "FAIL",
    "Conversation memory": "FAIL",
    "Retry logic": "FAIL"
}

# Configuration
NVIDIA_API_BASE_URL = "https://integrate.api.nvidia.com/v1"
MODEL_NAME = "z-ai/glm-5.2"


def get_client() -> OpenAI:
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise ValueError("NVIDIA_API_KEY not found in .env")
    return OpenAI(base_url=NVIDIA_API_BASE_URL, api_key=api_key)


def run_tests():
    print("Starting production verification audit...")
    try:
        client = get_client()
    except Exception as e:
        print(f"Failed to initialize OpenAI client: {e}")
        return

    # 1. Test API Connection (Non-streaming)
    print("\n[1/5] Testing API Connection...")
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": "Say 'OK' and nothing else."}],
            temperature=1.0,
            max_tokens=100
        )
        ans = response.choices[0].message.content.strip()
        print(f"Response: {ans}")
        if ans:
            RESULTS["API connection"] = "PASS"
    except Exception as e:
        print(f"API Connection Test failed: {e}")

    # 2. Test Streaming
    print("\n[2/5] Testing Streaming...")
    try:
        stream = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": "Count from 1 to 5 in words."}],
            temperature=1.0,
            max_tokens=100,
            stream=True
        )
        chunks = []
        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                chunks.append(chunk.choices[0].delta.content)
        joined = "".join(chunks).strip()
        print(f"Streamed response: {joined}")
        if len(chunks) > 1:
            RESULTS["Streaming"] = "PASS"
    except Exception as e:
        print(f"Streaming Test failed: {e}")

    # 3. Test Tool Calling
    print("\n[3/5] Testing Tool Calling...")
    tools = [
        {
            "type": "function",
            "function": {
                "name": "calculate_math",
                "description": "Evaluate math expressions",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {"type": "string"}
                    },
                    "required": ["expression"]
                }
            }
        }
    ]
    try:
        # Prompt model to use the tool
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": "What is 1528 * 4? Use your calculate_math tool."}],
            tools=tools,
            temperature=1.0,
            max_tokens=100
        )
        msg = response.choices[0].message
        if msg.tool_calls:
            print(f"Tool called: {msg.tool_calls[0].function.name} with arguments: {msg.tool_calls[0].function.arguments}")
            if msg.tool_calls[0].function.name == "calculate_math":
                RESULTS["Tool calling"] = "PASS"
        else:
            print("Model did not choose to invoke any tool.")
    except Exception as e:
        print(f"Tool Calling Test failed: {e}")

    # 4. Test Conversation Memory
    print("\n[4/5] Testing Conversation Memory...")
    try:
        history = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, my secret word is 'BROWNIE'."},
            {"role": "assistant", "content": "Understood. I will remember that your secret word is 'BROWNIE'."},
            {"role": "user", "content": "What is my secret word?"}
        ]
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=history,
            temperature=1.0,
            max_tokens=100
        )
        content = response.choices[0].message.content
        print(f"Response: {content}")
        if "BROWNIE" in content.upper():
            RESULTS["Conversation memory"] = "PASS"
    except Exception as e:
        print(f"Conversation Memory Test failed: {e}")

    # 5. Test Retry / Backoff Logic
    print("\n[5/5] Testing Retry Logic...")
    from main import call_chat_with_retry
    # Initialize a client with invalid base url to trigger retries
    bad_client = OpenAI(base_url="https://invalid.domain.nvidia.api/v1", api_key="dummy")
    start_time = time.time()
    try:
        # Try call - expect it to fail after retries
        call_chat_with_retry(bad_client, [{"role": "user", "content": "Hello"}], stream=False, use_tools=False)
    except OpenAIError as e:
        elapsed = time.time() - start_time
        print(f"Retry logic caught expected exception after {elapsed:.2f} seconds.")
        # If it retried 3 times with exponential backoff (2s, 4s delay), it should take at least 5-6 seconds total
        if elapsed >= 5.0:
            RESULTS["Retry logic"] = "PASS"
    except Exception as e:
        print(f"Retry logic test got unexpected error: {type(e)} {e}")

    # Output final summary table
    print("\n==============================")
    print("      Verification Audit")
    print("==============================")
    for test, res in RESULTS.items():
        print(f"{test}: {res}")
    print("==============================")

    # Exit with code 0 if all tests passed, 1 otherwise
    if all(val == "PASS" for val in RESULTS.values()):
        print("All verification audits PASSED successfully.")
        sys.exit(0)
    else:
        print("One or more verification audits FAILED.")
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
