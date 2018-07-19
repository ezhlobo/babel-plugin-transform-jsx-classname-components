import jsxSyntax from 'babel-plugin-syntax-jsx'

const isClassNameAttr = attribute =>
  attribute.name.name === 'className'

const factoryShouldBeProcessed = objects => (componentName) => {
  if (Array.isArray(objects)) {
    return new RegExp(`^(${objects.join('|')})$`).test(componentName)
  }

  return /^[A-Z]\w*$/.test(componentName)
}

const isGoodNameForNestedComponent = name =>
  /^[A-Z0-9_$]/.test(name)

export default ({ types: t }) => ({
  inherits: jsxSyntax,
  visitor: {
    JSXOpeningElement(JSXOpeningElement, { opts }) {
      const { node } = JSXOpeningElement

      const shouldBeProcessed = factoryShouldBeProcessed(opts.objects)

      // eslint-disable-next-line prefer-destructuring
      const name = node.name.name

      if (shouldBeProcessed(name)) {
        let property = null

        JSXOpeningElement.traverse({
          JSXAttribute(JSXAttribute) {
            if (isClassNameAttr(JSXAttribute.node)) {
              if (t.isStringLiteral(JSXAttribute.node.value)) {
                const classNameValue = JSXAttribute.node.value.value.split(' ')

                if (isGoodNameForNestedComponent(classNameValue[0])) {
                  // eslint-disable-next-line prefer-destructuring
                  property = classNameValue[0]
                }

                if (property) {
                  if (classNameValue.length > 1) {
                    JSXAttribute.get('value').replaceWith(t.stringLiteral(classNameValue.slice(1).join(' ')))
                  } else {
                    JSXAttribute.remove()
                  }
                }
              } else if (t.isJSXExpressionContainer(JSXAttribute.node.value)) {
                JSXAttribute.traverse({
                  ArrayExpression(ArrayExpression) {
                    const firstClassName = ArrayExpression.node.elements[0]

                    if (isGoodNameForNestedComponent(firstClassName.value)) {
                      ArrayExpression.get('elements')[0].remove()

                      property = firstClassName.value
                    }
                  },
                })
              }
            }
          },
        })

        if (property) {
          const tag = t.jSXMemberExpression(
            t.jSXIdentifier(name),
            t.jSXIdentifier(property),
          )

          JSXOpeningElement.get('name').replaceWith(tag)

          if (!JSXOpeningElement.node.selfClosing) {
            JSXOpeningElement.getSibling('closingElement').get('name').replaceWith(tag)
          }
        }
      }
    },
  },
})
