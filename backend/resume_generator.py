import json

from llm import ask_llm
from prompts import RESUME_PROMPT


def generate_resume(user_data):

    prompt = f"""
{RESUME_PROMPT}

Here is the user's information:

{json.dumps(user_data, indent=2)}

Generate the professional resume content.
"""

    result = ask_llm(prompt)

    # Remove accidental Markdown code blocks
    result = result.replace("```json", "")
    result = result.replace("```", "")
    result = result.strip()

    try:
        return json.loads(result)

    except json.JSONDecodeError:
        return {
            "error": "The AI returned invalid JSON",
            "raw_response": result
        }