# GLM-5.2 Conversational Agent with NVIDIA Integrate API

This project provides a clean, production-ready conversational agent utilizing the **z-ai/glm-5.2** model hosted on NVIDIA NIM (NVIDIA Integrate API) using the standard OpenAI Python SDK.

## Features

- 🧠 **Conversation History & Memory Persistence**: Retains context across dialogue turns in the session.
- ⚙️ **Customizable System Prompts**: Bootstraps assistant behavior and boundaries.
- 🔧 **Tool / Function Calling**: Demonstrates standard tool execution (e.g., local system time lookup and safe arithmetic evaluation).
- 🔄 **API Error Handling with Exponential Backoff**: Retries failed model API requests gracefully if rate limits or network issues arise.
- ⚡ **Real-time Token Streaming**: Supports live streaming for both regular dialogue and final response synthesis after tool execution.
- 🛑 **Clean Terminate Handlers**: Safely intercepts Ctrl+C and EOF signals to exit without Python stack trace output.

## Project Structure

```
project/
│── main.py            # Main application script with streaming, tools, history, and retry logic
│── requirements.txt   # Python package dependencies (openai, python-dotenv)
│── .env.example       # Template file for environment configurations
│── .gitignore         # Untracked files and folders to ignore in Git
└── README.md          # Project documentation (this file)
```

## Setup Instructions

1. **Navigate** to the project directory:
   ```bash
   cd project
   ```

2. **Create a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure your API Key**:
   - Create a `.env` file from the example:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and set your API key obtained from build.nvidia.com:
     ```env
     NVIDIA_API_KEY=your_actual_key_here
     ```

## Usage

Run the conversational agent:
```bash
python main.py
```

### Supported Commands

- `clear`: Clear conversational memory and reset context.
- `exit` / `quit`: Terminate script execution cleanly.
- Try asking: *"What is the current time?"* or *"What is (128 * 4) / 8?"* to see the tool calling integration in action!
