const babel = require('babel-core')
const common = require('common-prefix')
const plugin = require('..').default

const sanitizeSource = (src) => {
  const lines = src.trimRight().split('\n')

  if (lines.length > 1) {
    const minIndent = common(lines.filter(Boolean))

    return src.split('\n').map(line => line.substr(minIndent.length)).join('\n')
  }

  return src
}

const transform = (src = '', options = {}) => babel
  .transform(sanitizeSource(src), {
    ast: false,
    plugins: [
      [plugin, options],
    ],
  })
  .code
  .trim()

it('exists', () => {
  expect(plugin).toBeTruthy()
})

it('does not do anything with the simple code', () => {
  const source = `
    <div>
      <Component className="hello" />
      <Component.Inner className="hello" />
      <Component.Inner className="CamelCasedClassName" />
    </div>
  `

  expect(transform(source)).toMatchSnapshot()
})

it('transforms component if capitalized class name goes first', () => {
  const source = `
    <React.Fragment>
      <Component data-text="extra" className="Inner extra" />
      <Component data-text="extra" className="extra Inner" />
    </React.Fragment>
  `

  expect(transform(source)).toMatchSnapshot()
})

it('transforms computed attributes', () => {
  const source = `
    <React.Fragment>
      <Component className={['Inner', 'simple'].join(' ')} />
      <Component className={['Inner', true && 'simple'].join(' ')} />
    </React.Fragment>
  `

  expect(transform(source)).toMatchSnapshot()
})

it('transforms with closing names', () => {
  const source = `
    <React.Fragment>
      <One>Hello</One>
      <Two className="Inner">Hello</Two>
      <Three>Hello</Three>
      <Four className="Inner"><FourNested>Hello</FourNested></Four>
      <Five><FiveNested className="Inner">Hello</FiveNested></Five>
      <Six className="Inner"><SixNested className="Inner">Hello</SixNested></Six>
    </React.Fragment>
  `

  expect(transform(source)).toMatchSnapshot()
})

it('transforms with unusual names', () => {
  const source = `
    <React.Fragment>
      <A className="B" />
      <A0 className="B0" />
      <CamelCase className="CamelCase" />
      <CamelCase0 className="CamelCase0" />
      <CamelCase className="$CamelCase" />
      <Camel_Case className="_Snake_Case" />
    </React.Fragment>
  `

  expect(transform(source)).toMatchSnapshot()
})

describe('with option "objects"', () => {
  const transformWithObjects = source => transform(source, {
    objects: ['Icons', 'Navigation'],
  })

  it('transforms only specified objects', () => {
    const source = `
      <React.Fragment>
        <Component className="Inner" />
        <Icons className="Inner" />
        <Navigation className="Inner" />
      </React.Fragment>
    `

    expect(transformWithObjects(source)).toMatchSnapshot()
  })

  it('leaves previous class names but removes used one', () => {
    const source = `
      <React.Fragment>
        <Component className="Inner second" />
        <Icons className="Inner second" />
        <Navigation className="Inner second" />
      </React.Fragment>
    `

    expect(transformWithObjects(source)).toMatchSnapshot()
  })
})

describe('with option "attribute"', () => {
  const transformWithAttribute = source => transform(source, {
    attribute: 'styleName',
  })

  it('transforms only specified attributes', () => {
    const source = `
      <React.Fragment>
        <A className="Inner" styleName="Inner" />
        <B styleName="Inner" />
        <C className="Inner" />
      </React.Fragment>
    `

    expect(transformWithAttribute(source)).toMatchSnapshot()
  })
})
