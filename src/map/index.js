/*
 * Copyright (C) 2017 dehai.site All Rights Reserved.
 *
 * @author level <dehai168@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'
import L from 'leaflet';
import proj4leaflet from "proj4leaflet";
import markerIconSrc from "../assets/polygon.png";
import cancelSrc from "../assets/cancel.png";

export class Map {
    /**
     * 初始化地图
     * @param {String} domid   标签元素id
     * @param {Object} options 地图参数
     */
    constructor(domid, options) {
        let type = options.type ? options.type : '';
        let zoom = options.zoom ? options.zoom : 5;
        let center = options.center ? options.center : [34.161818, 106.523438];
        //地图部分
        let crs = this._getCRS(type.indexOf('BMap') > -1 ? 'BMap' : type);
        this.mapLayer = this._getLayer(type);
        let option = {
            crs: crs, zoomControl: false
        };
        if (crs === null) {
            delete option.crs;
        }
        this.map = new L.map(domid, option);

        this.map.addControl(L.control.zoom({ position: "topright" }));
        this.map.addControl(L.control.scale());
        this.map.addLayer(this.mapLayer);
        this.map.setView(center, zoom);
    }
    _getLayer(type) {
        let mapLayer = null;
        switch (type) {
            case 'BMap':
                mapLayer = new L.tileLayer(
                    "https://ss{s}.bdstatic.com/8bo_dTSlR1gBo1vgoIiO_jowehsv/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&udt=20190125&scaler=1",
                    {
                        maxZoom: 18,
                        minZoom: 5,
                        subdomains: [0, 1, 2, 3],
                        attribution: "ⓒ 2019 Baidu",
                        tms: true
                    }
                );
                break;
            case 'BMap_Sate':
                mapLayer = new L.tileLayer(
                    "https://ss{s}.bdstatic.com/8bo_dTSlR1gBo1vgoIiO_jowehsv/starpic/?qt=satepc&u=x={x};y={y};z={z};v=009;type=sate&fm=46&app=webearth2&v=009&udt=20190305",
                    {
                        maxZoom: 18,
                        minZoom: 5,
                        subdomains: [0, 1, 2, 3],
                        attribution: "ⓒ 2019 Baidu",
                        tms: true
                    }
                );
                break;
            case 'BMap_Custom_midnight': //light,redalert,googlelite,grassgreen,pink,darkgreen,bluish,grayscale,hardedge
                mapLayer = new L.tileLayer(
                    "http://api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20190305&scale=1&customid=midnight",
                    {
                        maxZoom: 18,
                        minZoom: 5,
                        subdomains: [0, 1, 2],
                        attribution: "ⓒ 2019 Baidu",
                        tms: true
                    }
                );
                break;
            case 'BMap_Custom_dark':
                mapLayer = new L.tileLayer(
                    "http://api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20190305&scale=1&customid=dark",
                    {
                        maxZoom: 18,
                        minZoom: 5,
                        subdomains: [0, 1, 2],
                        attribution: "ⓒ 2019 Baidu",
                        tms: true
                    }
                );
                break;
            case 'BMap_Custom_grayscale':
                mapLayer = new L.tileLayer(
                    "http://api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20190305&scale=1&customid=grayscale",
                    {
                        maxZoom: 18,
                        minZoom: 5,
                        subdomains: [0, 1, 2],
                        attribution: "ⓒ 2019 Baidu",
                        tms: true
                    }
                );
                break;
            case "GMap":
                mapLayer = new L.tileLayer('http://mt{s}.google.cn/vt/lyrs=m@160000000&hl=zh-CN&gl=CN&src=app&y={y}&x={x}&z={z}&s=Ga',
                    {
                        subdomains: [0, 1, 2, 3],
                        attribution: '© <a href="http://www.google.cn/maps">GoogleMap</a> contributors'
                    }
                );
                break;
            case "GMap_Sate":
                mapLayer = new L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@821&gl=cn&x={x}&y={y}&z={z}',
                    {
                        subdomains: [0, 1, 2, 3],
                        attribution: '© <a href="http://www.google.cn/maps">GoogleMap</a> contributors'
                    }
                );
                break;
            case "SSMap":
                mapLayer = new L.tileLayer('http://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0',
                    {
                        tms: true,
                        subdomains: [0, 1, 2, 3],
                        attribution: '© <a href="http://map.soso.com">SoSoMap</a> contributors'
                    }
                );
                break;
            case "AMap":
                mapLayer = new L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
                    {
                        subdomains: [1, 2, 3, 4],
                        attribution: '© <a href="http://www.amap.cn">AMap</a> contributors'
                    }
                );
                break;
            case "AMap_Sate":
                mapLayer = new L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
                    {
                        subdomains: [1, 2, 3, 4],
                        attribution: '© <a href="http://www.amap.cn">AMap</a> contributors'
                    }
                );
                break;
            default:
                mapLayer = new L.tileLayer(
                    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
                    {
                        maxZoom: 18,
                        attribution:
                            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                        id: "mapbox.streets"
                    }
                );
                break;
        }
        return mapLayer;
    }
    _getCRS(type) {
        let crs = null;
        switch (type) {
            case 'BMap':
                crs = new L.Proj.CRS(
                    //"EPSG:3395",
                    //"+proj=merc +lon_0=0 +k=1 +x_0=140 +y_0=-250 +datum=WGS84 +units=m +no_defs",
                    'EPSG:900913',
                    '+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
                    {
                        resolutions: (function () {
                            let level = 19;
                            let res = [];
                            res[0] = Math.pow(2, 18);
                            for (let i = 1; i < level; i++) {
                                res[i] = Math.pow(2, 18 - i);
                            }
                            return res;
                        })(),
                        origin: [0, 0],
                        bounds: L.bounds([20037508.342789244, 0], [0, 20037508.342789244])
                    }
                );
                break;
            default:
                break;
        }
        return crs;
    }
    /**
     * 修改地图缩放等级
     * @param {Number} zoom 
     */
    setZoom(zoom) {
        if (typeof zoom === 'string') {
            zoom = parseInt(zoom);
        }
        this.map.setZoom(zoom);
    }
    /**
     * 设定地图给定的地点和缩放
     * @param {*} point 经纬度
     * @param {*} zoom 缩放等级
     */
    setView(point, zoom) {
        if (typeof point === 'object') {
            if (typeof zoom === 'string') {
                zoom = parseInt(zoom);
            }
            this.map.setView(point, zoom);
        }
    }
    /**
     * 全图
     */
    minZoom() {
        const zoom = this.map.getMinZoom();
        this.map.setZoom(zoom);
    }
    /**
     * 最大
     */
    maxZoom() {
        const zoom = this.map.getMaxZoom();
        this.map.setZoom(zoom);
    }
    /**
     * 放大
     */
    zoomIn() {
        this.map.zoomIn();
    }
    /**
     * 缩小
     */
    zoomOut() {
        this.map.zoomOut();
    }
    /**
     * 定位
     */
    locate() {
        this.map.locate({
            setView: true,
            maxZoom: 16
        });
    }
    /**
     * 停止定位
     */
    stopLocate() {
        this.map.stopLocate();
    }
    /**
     * 计算面积
     */
    area() {

    }

    /**
     * 拉框缩小
     */
    boxIn() {
        let that = this;
        let latlngs = [];
        let rectangle = null;
        let mousemoveEvent = function (e) {
            if (rectangle !== null) {
                if (latlngs.length === 1) {
                    latlngs.push(e.latlng);
                } else {
                    latlngs[1] = e.latlng;
                }
                rectangle.setBounds(latlngs);
            }
        };
        let clickEvent = function (e) {
            if (rectangle === null) {
                latlngs.push(e.latlng);
                rectangle = L.rectangle(latlngs, { color: 'blue' });
                rectangle.addTo(that.map);
            } else {
                const bounds = L.latLngBounds(latlngs[0], latlngs[1]);
                that.map.panInsideBounds(bounds);
                setTimeout(function () {
                    that.map.zoomOut();
                }, 500);
                rectangle.remove();
                that.map.off('click', clickEvent);
                that.map.off('mousemove', mousemoveEvent);
            }
        };
        this.map.on('click', clickEvent);
        this.map.on('mousemove', mousemoveEvent);
    }
    /**
     * 拉框放大
     */
    boxOut() {
        let that = this;
        let latlngs = [];
        let rectangle = null;
        let mousemoveEvent = function (e) {
            if (rectangle !== null) {
                if (latlngs.length === 1) {
                    latlngs.push(e.latlng);
                } else {
                    latlngs[1] = e.latlng;
                }
                rectangle.setBounds(latlngs);
            }
        };
        let clickEvent = function (e) {
            if (rectangle === null) {
                latlngs.push(e.latlng);
                rectangle = L.rectangle(latlngs, { color: 'blue' });
                rectangle.addTo(that.map);
            } else {
                const bounds = L.latLngBounds(latlngs[0], latlngs[1]);
                that.map.fitBounds(bounds);
                rectangle.remove();
                that.map.off('click', clickEvent);
                that.map.off('mousemove', mousemoveEvent);
            }
        };
        this.map.on('click', clickEvent);
        this.map.on('mousemove', mousemoveEvent);
    }
    /**
     * 测量距离
     */
    distance() {
        let that = this;
        let polyline = null;
        let latlngs = [];
        let markerIcon = L.icon({
            iconUrl: markerIconSrc,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
        });
        let cancelIcon = L.icon({
            iconUrl: cancelSrc,
            iconSize: [12, 12],
            iconAnchor: [-12, 6],
        });
        let markerList = [];
        let distance = 0;
        let clickEvent = function (e) {
            latlngs.push(e.latlng);
            let marker = L.marker(e.latlng, { icon: markerIcon }).addTo(that.map);
            if (polyline === null) {
                polyline = L.polyline(latlngs, { color: 'blue' });
                polyline.addTo(that.map);
            } else {
                polyline.setLatLngs(latlngs);
                let first = latlngs[latlngs.length - 2];
                let last = latlngs[latlngs.length - 1];
                distance += that.map.distance(first, last);
                marker.bindTooltip(distance > 1000 ? (distance / 1000).toFixed(2) + "km" : distance.toFixed(2) + "m").openTooltip();
            }
            markerList.push(marker);
        };
        let markerClickEvent = function (e) {
            polyline.remove();
            markerList.forEach(element => {
                element.remove();
            });
        };
        let dblclickEvent = function (e) {
            let cancelMarker = L.marker(e.latlng, { icon: cancelIcon }).addTo(that.map);
            cancelMarker.on('click', markerClickEvent);
            markerList.push(cancelMarker);
            that.map.off('click', clickEvent);
            that.map.off('dblclick', dblclickEvent);
        };
        this.map.on('click', clickEvent);
        this.map.on('dblclick', dblclickEvent);
    }
    /**
     * 移动地图到坐标
     * @param {array} point [lng,lat]
     */
    flyTo(point) {
        if (typeof point === 'object') {
            this.map.flyTo(point);
        }
    }
    /**
     * 移动地图到坐标
     * @param {*} point 
     */
    panTo(point) {
        if (typeof point === 'object') {
            this.map.panTo(point);
        }
    }
    /**
     * 移动地图到视野
     * @param {array} pointNW [lng,lat]
     * @param {array} pointSE [lng,lat]
     */
    flyToBounds(pointNW, pointSE) {
        if (typeof pointNW === 'object' && typeof pointSE === 'object') {
            this.map.flyToBounds([pointNW, pointSE]);
        }
    }
    /**
     * 
     * @param {*} pointNW 
     * @param {*} pointSE 
     */
    fitBounds(pointNW, pointSE) {
        if (typeof pointNW === 'object' && typeof pointSE === 'object') {
            this.map.fitBounds([pointNW, pointSE]);
        }
    }
    /**
     * 切换地图
     * @param {String} type? BMap/GMap/AMap
     */
    changeMap(type) {
        let center = this.map.getCenter();
        let zoom = this.map.getZoom();
        let crs = this._getCRS(type.indexOf('BMap') > -1 ? 'BMap' : type);
        if (crs !== null) {
            this.map.options.crs = crs;
        } else {
            this.map.options.crs = L.CRS.EPSG3857;
        }
        let mapLayer = this._getLayer(type);
        this.map.removeLayer(this.mapLayer);
        this.map.addLayer(mapLayer);
        this.map.setView(center, zoom);
        this.mapLayer = mapLayer;
    }
    /**
     * 创建自定义Canvas面板
     */
    createCanvasPane() {
        let canvas = L.DomUtil.create('canvas');
        let pane = this.map.createPane('customCanvas');
        let size = this.map.getSize();
        let that = this;

        this.customCanvasPaneResizeEvent = function (e) {
            size = that.map.getSize();
            canvas.width = size.x;
            canvas.height = size.y;
        };
        this.customCanvasPaneMoveendEvent = function (e) {
            let topLeft = that.map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(canvas, topLeft);
        };
        this.map.on('resize', this.customCanvasPaneResizeEvent);
        this.map.on('moveend', this.customCanvasPaneMoveendEvent);

        canvas.width = size.x;
        canvas.height = size.y;
        pane.style['z-index'] = 300;
        pane.appendChild(canvas);
        return canvas;
    }
    /**
     * 移除自定义Canvas面板
     */
    removeCanvasPane() {
        let pane = this.map.getPane('customCanvas');
        pane.parentNode.removeChild(pane);
        this.map.off('resize', this.customCanvasPaneResizeEvent);
        this.map.off('moveend', this.customCanvasPaneMoveendEvent);
    }
    /**
     * 查询包含在列表内的点
     * @param {*} list 定位列表
     * @param {*} latlngs 区域
     */
    findExist(list, latlngs) {
        const result = [];
        const bounds = L.latLngBounds(latlngs[0], latlngs[1]);
        list.forEach(element => {
            if (bounds.contains([element.lat, element.lng])) {
                result.push({ id: element.id, text: element.text });
            }
        });
        return result;
    }
}