# parse-assets

Parse a list of HTML, CSS and JS assets from a HTML file.

**Supports HTML Imports.**

## Usage

```
npm install --save-dev parse-assets

# usage with base as the current directory
parse-assets index.html

# usage with base directory specified
# (looks for `src/index.html`)
parse-assets src/ index.html
```