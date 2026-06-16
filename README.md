# BharatKathaAI

A Python-based AI chatbot specialized in Indian culture and heritage. This interactive chatbot uses the Groq API with the Llama3-70b-8192 model to answer questions exclusively about Indian culture, traditions, history, and heritage.

## 🌟 Features

- 🤖 AI-powered conversational bot using Llama3-70b-8192 model
- 🇮🇳 Specialized knowledge in Indian culture and heritage
- 💬 Interactive command-line interface
- 🚪 Simple exit command ("quit") to end the conversation
- ⚡ Fast responses powered by Groq's inference engine
- 🎯 Focused expertise on Indian traditions, festivals, history, and cultural practices

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Example Conversations](#example-conversations)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [API Information](#api-information)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [Future Improvements](#future-improvements)
- [License](#license)

## Prerequisites

- Python 3.7 or higher
- Groq API key ([Get your API key here](https://console.groq.com/))
- Stable internet connection
- pip (Python package installer)

### Checking Python Version

```bash
python --version
# or
python3 --version
```

## Installation

### Step 1: Clone or Download

```bash
git clone <your-repository-url>
cd "Python chatbot"
```

Or simply download and extract the project folder.

### Step 2: Install Dependencies

Install the required Python package:

```bash
pip install -r requirements.txt
```

Or install directly:

```bash
pip install openai
```

### Step 3: Verify Installation

```bash
python -c "import openai; print('Installation successful!')"
```

## Configuration

### Method 1: Direct Configuration (Quick Start)

1. Open `apibot.py` in a text editor
2. Replace `"your_api_key"` on line 4 with your actual Groq API key:

```python
api_key ="your_actual_groq_api_key_here",
```

### Method 2: Environment Variables (Recommended)

For better security, use environment variables:

1. Create a `.env` file (or set environment variable):

**Windows (PowerShell):**
```powershell
$env:GROQ_API_KEY="your_actual_groq_api_key_here"
```

**Windows (CMD):**
```cmd
set GROQ_API_KEY=your_actual_groq_api_key_here
```

**Linux/Mac:**
```bash
export GROQ_API_KEY="your_actual_groq_api_key_here"
```

2. Modify `apibot.py` to read from environment:

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key = os.getenv("GROQ_API_KEY", "your_api_key"),
    base_url = "https://api.groq.com/openai/v1"
)
```

## Usage

### Basic Usage

1. Run the chatbot:

```bash
python apibot.py
```

2. Start chatting! Ask questions about Indian culture and heritage:

```
What you want to ask me? What is the significance of Diwali?
Bot: [AI response about Diwali]

What you want to ask me? Tell me about Indian classical dance forms
Bot: [AI response about dance forms]

What you want to ask me? What are the main festivals in India?
Bot: [AI response about festivals]
```

3. To exit the chatbot, simply type `quit`:

```
What you want to ask me? quit
Bot: GoodBye Sweetheart
```

### Example Questions You Can Ask

- "What is the history of yoga?"
- "Tell me about the Taj Mahal"
- "What are the major Indian classical dance forms?"
- "Explain the significance of Holi festival"
- "What is the meaning behind different Indian festivals?"
- "Tell me about Indian traditional clothing"
- "What are the major religions in India?"

## How It Works

1. The bot initializes a connection to the Groq API using the OpenAI-compatible client
2. A continuous loop waits for user input
3. Each question is sent to the Llama3-70b-8192 model with a system prompt that restricts responses to Indian culture and heritage
4. The model processes the query and generates a contextual response
5. The response is displayed to the user
6. The loop continues until the user types "quit"

### System Prompt

The chatbot uses a specialized system prompt:

```
"You are an excellent indian culture and heritage bot who has all the knowledge about indian culture and heritage only and you are not going to consider anyother information"
```

This ensures the bot focuses exclusively on Indian cultural topics.

## Example Conversations

### Example 1: Festival Information

```
What you want to ask me? What is Diwali and why is it celebrated?
Bot: Diwali, also known as Deepavali, is one of the most important festivals in India...
[Detailed explanation about Diwali]
```

### Example 2: Cultural Practices

```
What you want to ask me? What is the significance of namaste in Indian culture?
Bot: Namaste is a traditional Indian greeting that holds deep cultural and spiritual significance...
[Detailed explanation about namaste]
```

### Example 3: Historical Monuments

```
What you want to ask me? Tell me about the cultural importance of the Taj Mahal
Bot: The Taj Mahal, located in Agra, is not just an architectural wonder but also a symbol of...
[Detailed explanation about Taj Mahal]
```

## Project Structure

```
Python chatbot/
├── apibot.py          # Main chatbot application
├── requirements.txt   # Python dependencies
├── README.md          # Project documentation
└── .gitignore         # Git ignore file (recommended)
```

## Dependencies

- **openai** (>=1.0.0) - OpenAI-compatible Python client for API interactions with Groq

### Dependency Details

The `openai` package provides:
- Client interface for API communication
- Chat completion functionality
- Error handling and retry logic

## API Information

- **API Provider**: Groq
- **API Documentation**: [Groq API Docs](https://console.groq.com/docs)
- **Model**: llama3-70b-8192
- **Base URL**: https://api.groq.com/openai/v1
- **Rate Limits**: Check Groq's current rate limits on their dashboard

### Getting Your API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it will only be shown once)

## Security Best Practices

### ⚠️ Important Security Notes

1. **Never commit API keys to version control**
   - Add `apibot.py` to `.gitignore` if it contains your key
   - Use environment variables instead
   - Consider using `.env` files (add `.env` to `.gitignore`)

2. **Keep your API key secure**
   - Don't share your API key publicly
   - Rotate your key if it's accidentally exposed
   - Monitor API usage in Groq dashboard

3. **Recommended .gitignore entries**:

```
# API Keys
apibot.py
.env
*.env

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: `ModuleNotFoundError: No module named 'openai'`

**Solution:**
```bash
pip install openai
# or
pip3 install openai
```

#### Issue: API Authentication Error

**Symptoms:** Error messages about invalid API key or authentication

**Solutions:**
- Verify your API key is correct in `apibot.py`
- Check if your API key is active in Groq console
- Ensure there are no extra spaces or quotes around the API key
- Try regenerating your API key

#### Issue: Connection Timeout

**Symptoms:** Script hangs or shows connection errors

**Solutions:**
- Check your internet connection
- Verify Groq API status
- Check firewall settings
- Try again after a few moments (could be temporary API issue)

#### Issue: Rate Limit Exceeded

**Symptoms:** Error messages about rate limits

**Solutions:**
- Wait a few moments before trying again
- Check your API usage limits in Groq dashboard
- Consider upgrading your Groq plan if needed

#### Issue: Model Not Found Error

**Symptoms:** Error about model "llama3-70b-8192" not found

**Solutions:**
- Verify the model name is correct
- Check Groq's available models
- Update to the latest model name if changed

### Getting Help

If you encounter other issues:
1. Check the [Groq API Documentation](https://console.groq.com/docs)
2. Review error messages carefully
3. Ensure all dependencies are installed correctly
4. Verify your Python version is compatible (3.7+)

## FAQ

### Q: Can I use this bot for topics other than Indian culture?

**A:** The bot is specifically configured to respond only to questions about Indian culture and heritage. The system prompt restricts it to this domain. You can modify the system prompt in `apibot.py` if you want to change its focus.

### Q: Is the Groq API free?

**A:** Groq offers free tier usage with certain limits. Check their [pricing page](https://console.groq.com/) for current rates and limits.

### Q: Can I customize the bot's responses?

**A:** Yes! You can modify the system prompt in `apibot.py` (line 18) to change the bot's personality, expertise area, or response style.

### Q: How do I save conversation history?

**A:** Currently, the bot doesn't save conversation history. You could enhance it by adding file logging or database storage.

### Q: Can I use a different AI model?

**A:** Yes, you can change the model name on line 14 of `apibot.py`. Check Groq's documentation for available models.

### Q: Is my data stored by Groq?

**A:** Review Groq's privacy policy and terms of service for information about data handling. Generally, API providers may log requests for service improvement and abuse prevention.

### Q: What Python version do I need?

**A:** Python 3.7 or higher is required. Python 3.8+ is recommended for best compatibility.

## Limitations

- **Single-turn conversations**: The bot doesn't maintain context between multiple questions in a conversation
- **Internet required**: The bot needs an active internet connection to access the Groq API
- **API dependency**: Service availability depends on Groq's API status
- **Rate limits**: Subject to Groq's API rate limiting policies
- **Focused domain**: Only responds to questions about Indian culture and heritage by design
- **No conversation history**: Each query is independent; previous context is not retained
- **Command-line only**: Currently operates in terminal/command prompt only

## Contributing

Contributions are welcome! Here are some ways you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Areas for Contribution

- Adding conversation history/memory
- Implementing a GUI interface
- Adding support for multiple languages
- Enhancing error handling
- Adding conversation export features
- Creating unit tests
- Improving documentation
- Adding support for different AI models

### Code Style

- Follow PEP 8 Python style guide
- Add comments for complex logic
- Keep functions focused and modular
- Include docstrings for functions

## Future Improvements

### Planned Features

- [ ] Conversation history/memory system
- [ ] GUI interface (using Tkinter or web-based)
- [ ] Support for multiple languages
- [ ] Conversation export (text/JSON)
- [ ] Better error handling and retry logic
- [ ] Configurable system prompts
- [ ] Support for different AI models
- [ ] Streaming responses for real-time output
- [ ] Multi-turn conversation context
- [ ] Configuration file support

### Enhancement Ideas

- Add a web interface using Flask/FastAPI
- Implement conversation saving and loading
- Add support for voice input/output
- Create a mobile app version
- Add support for image-based questions
- Implement user profiles and preferences

## License

This project is open source and available for personal and educational use.

---

## Acknowledgments

- Built with [Groq](https://groq.com/) API
- Powered by Llama3-70b-8192 model
- Uses [OpenAI Python Library](https://github.com/openai/openai-python)

---

**Made with ❤️ for preserving and sharing Indian culture and heritage**

For questions, issues, or contributions, please open an issue on the repository.
