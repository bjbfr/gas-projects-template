# Typescript support

Here is detailed how to use typescript within Google AppScript Project: [Typescript Support](https://github.com/google/clasp/blob/master/docs/typescript.md#typescript-support)

Common settings for typescript is defined in templates/tsconfig-gas.json (a link to that file is set in each lib/project, when using init_lib/init_project commands)

- Values that cannot be changed.
```
{
  "isolatedModules": true,
  "noLib": true,
  "noResolve": true,
  "module": "None"
}
```
- V8 support
```
{
  "target": "ES2019"
}
```
- Other recommended values:
```
{
  "noImplicitUseStrict": true,
  "experimentalDecorators": true,
}
```

# Module

As mentionned above, Google App Script does not support ES6 module. As advised in above reference, typescript namescpaces are expected to be used to mimic that feature.