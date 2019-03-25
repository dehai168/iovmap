### Map类 (domid,options)

>方法

1. 初始化

```js
   let iovMap=new IOVMap.Map('domid',mapType); //mapType=BMap/BMap_Sate/BMap_Custom_midnight/BMap_Custom_dark/BMap_Custom_grayscale/GMap/GMap_Sate/AMap/AMap_Sate/SSMap
```

2. 设置zoom

```js
   iovMap.setZoom(number);
```

3. 鸟瞰到地图某点

```js
    iovMap.flyTo([lat,lng]);
```
4. 移动到地图某点
```js
    iovMap.panTo([lat,lng]);
```

5. 鸟瞰到地图某区域
```js
    iovMap.flyToBounds([lat,lng],[lat,lng]);
```
6. 移动到地图某区域
```js
    iovMap.fitBounds([lat,lng],[lat,lng]);
```
7. 改变地图类型
```js
    iovMap.changeMap(mapType);
```

### Marker类
