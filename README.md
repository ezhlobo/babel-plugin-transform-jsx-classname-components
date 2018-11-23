# babel-plugin-transform-jsx-classname-components

:sunglasses: *Long name, right...*

[![npm version](https://img.shields.io/npm/v/babel-plugin-transform-jsx-classname-components.svg?longCache)](https://www.npmjs.com/package/babel-plugin-transform-jsx-classname-components) [![CI Status](https://img.shields.io/circleci/project/github/ezhlobo/babel-plugin-transform-jsx-classname-components/master.svg?longCache)](https://circleci.com/gh/ezhlobo/babel-plugin-transform-jsx-classname-components/tree/master) [![Greenkeeper badge](https://badges.greenkeeper.io/ezhlobo/babel-plugin-transform-jsx-classname-components.svg)](https://greenkeeper.io/)

## What

It takes your first class name (if it starts with up-case) and use it as property for component.

```jsx
<Component className="Inner" />
```

Will be transformed into this:

```jsx
<Component.Inner />
```

## Why

You don't need this plugin unless you use [Pug with react](https://github.com/pugjs/babel-plugin-transform-react-pug). Pug consider everything after dot as class names, so it converts code like:

```jsx
pug`Component.Inner Hello`
```

Into this:

```jsx
<Component className="Inner">Hello</Component>
```

This plugin was created to change the result to this one:

```jsx
<Component.Inner>Hello</Component.Inner>
```

## How

```
yarn add --dev babel-plugin-transform-jsx-classname-components
```

In `.babelrc`:

```
{
  "plugins": [
    "transform-jsx-classname-components"
  ]
}
```

*Note: It should be placed after transforming Pug into Jsx.*

## Options

| Name | Type | Default | Description
| - | - | - | -
| [`objects`](#objects) | `Array<string>` | null | It specifies what objects should be processed
| [`attribute`](#attribute) | `String` | `className` | It specifies attribute name which should be processed

### `objects`

If you set it to `['Icons']` it will handle only `<Icons ... />`:

```jsx
<Component className="Inner" />
<Icons className="Inner" />
```

Will be transformed into:

```jsx
<Component className="Inner" />
<Icons.Inner  />
```

### `attribute`

If you set it to `styleName` it will process `styleName` attribute instead of default one:

```jsx
<Component styleName="Inner" />
<Icons className="JustClass" styleName="Inner" />
```

Will be transformed into:

```jsx
<Component.Inner />
<Icons.Inner className="JustClass"  />
```
