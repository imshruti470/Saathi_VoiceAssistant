import sys
import json
import yake

def extract_keywords(text):
    kw_extractor = yake.KeywordExtractor(n=2, top=10)  # Extract 2-word phrases, top 10
    keywords = kw_extractor.extract_keywords(text)
    return [kw[0] for kw in keywords]  # Return only the keyword strings

if __name__ == "__main__":
    try:
        input_text = sys.stdin.read().strip()  # Read input from Node.js
        if not input_text:
            raise ValueError("No input text provided")

        keywords = extract_keywords(input_text)
        print(json.dumps({"keywords": keywords}))  # Return JSON output

    except Exception as e:
        print(json.dumps({"error": str(e)}))
