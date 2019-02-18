---
layout: default
---

基于leaflet开发,支持多地图切换,统一封装上层业务调用接口,让更换地图不用再修改业务代码,以满足行业应用。

在业余时间开发,难免会有诸多bug

其实本来想做个Vue版本的,但是太懒了！

### 技术栈

es6+webpack+leaflet


### 使用

```html
<div id="app" style="width: 800px; height: 600px;"></div>
```
```js
// Javascript code .
let hmap = new HMap.Map('app', 'BMap');
```

### Demo

[打开](demo.html)

### API

[打开](api.md)