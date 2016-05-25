# parse-assets

Parse a list of HTML, CSS and JS assets from a HTML file.

**Supports HTML Imports.**

## Usage

To install globally and use directly from the command line:
```
npm install -g parse-assets

# usage with base as the current directory
parse-assets index.html

# usage with base directory specified (looks for `src/index.html`)
parse-assets src/ index.html
```

To install as a local dependency in a project:
```
npm install --save-dev parse-assets

# in package.json:
# {
#   "scripts": {
#     "list-assets": "parse-assets index.html"
#   }
# }

npm run list-assets
```