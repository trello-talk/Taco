module.exports = class CodeBlock {
  static apply(content, lang = null) {
    return `\`\`\`${lang ? `${lang}\n` : ''}${content}\`\`\``
  }
}