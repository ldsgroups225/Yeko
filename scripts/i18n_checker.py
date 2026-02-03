import os
import re
import sys

def find_hardcoded_strings(directory):
    print(f"Scanning {directory} for hardcoded strings...")
    # Regex for JSX text content: >Some Text<
    # We look for >([^<{]+)< ensuring no { inside
    jsx_text_pattern = re.compile(r'>\s*([^<{}\n]+?)\s*<')
    
    # Regex for attributes: placeholder="Some Text" or title="Some Text"
    # We match placeholder|title|alt|label ="([^"{]+)"
    attr_pattern = re.compile(r'\b(placeholder|title|alt|label|aria-label)\s*=\s*"([^"{]+)"')
    
    found_issues = []

    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith(('.tsx', '.ts')):
                continue
            
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            lines = content.split('\n')
                
            for i, line in enumerate(lines):
                # Check JSX Text
                matches = jsx_text_pattern.findall(line)
                for match in matches:
                    text = match.strip()
                    if text and not text.isspace() and len(text) > 1:
                        # Filter out common symbols or numbers
                        if not re.match(r'^[0-9\W]+$', text):
                             found_issues.append((path, i+1, f"Text: '{text}'"))

                # Check Attributes
                matches = attr_pattern.findall(line)
                for attr, text in matches:
                    text = text.strip()
                    if text and not text.isspace() and len(text) > 1:
                         if not re.match(r'^[0-9\W]+$', text):
                            found_issues.append((path, i+1, f"Attr {attr}: '{text}'"))

    return found_issues

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 i18n_checker.py <directory>")
        sys.exit(1)
        
    directory = sys.argv[1]
    issues = find_hardcoded_strings(directory)
    
    if issues:
        print(f"Found {len(issues)} potential hardcoded strings:")
        for path, line, msg in issues:
            print(f"{path}:{line} - {msg}")
        # sys.exit(1) # Don't fail the build for now, just report
    else:
        print("No obvious hardcoded strings found.")
        sys.exit(0)
