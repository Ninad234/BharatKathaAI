from openai import OpenAI

client = OpenAI(
    api_key ="your_api_key",
    base_url ="https://api.groq.com/openai/v1"
)

while True:
    user_input = input("What you want to ask me? ")
    if user_input == "quit":
        print("Bot: GoodBye Sweetheart")
        break
    response = client.chat.completions.create(
        model = "llama3-70b-8192",
        messages = [
            {
                "role":"system",
                "content" : "You are an excellent indian culture and heritage bot who has all the knowledge about indian culture and heritage only and you are not going to consider anyother information"
            },
            {
                "role":"user",
                "content":user_input
            }
        ]
    )
    print("Bot: ",response.choices[0].message.content)