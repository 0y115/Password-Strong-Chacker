<div align="center">

# 🔒 Password Strong Checker

**Know how secure your password really is — and generate one that actually holds up.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Powered by zxcvbn](https://img.shields.io/badge/Powered%20by-zxcvbn-7c6ff0)](https://github.com/dropbox/zxcvbn)

</div>

---

A free, client-side tool that checks password strength using **[zxcvbn](https://github.com/dropbox/zxcvbn)** (Dropbox's pattern-detection engine) instead of just counting length and character types. It also includes a secure password generator.

## Features

- 🎯 Accurate strength scoring based on real pattern detection (repeats, sequences, dictionary words)
- ⏱️ Realistic crack-time estimate
- 🎲 Secure generator (`crypto.getRandomValues`)
- 🌗 Light / Dark mode
- 🔐 100% client-side — nothing is sent over the network

## Usage

Keep `index.html`, `style.css`, and `script.js` in the same folder, then open `index.html` in your browser.

