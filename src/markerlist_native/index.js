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
import offline_0 from "../assets/0/0.png";
import offline_1 from "../assets/0/1.png";
import offline_2 from "../assets/0/2.png";
import offline_3 from "../assets/0/3.png";
import offline_4 from "../assets/0/4.png";
import offline_5 from "../assets/0/5.png";
import offline_6 from "../assets/0/6.png";
import offline_7 from "../assets/0/7.png";
import offline_8 from "../assets/0/8.png";
import online_0 from "../assets/1/0.png";
import online_1 from "../assets/1/1.png";
import online_2 from "../assets/1/2.png";
import online_3 from "../assets/1/3.png";
import online_4 from "../assets/1/4.png";
import online_5 from "../assets/1/5.png";
import online_6 from "../assets/1/6.png";
import online_7 from "../assets/1/7.png";
import online_8 from "../assets/1/8.png";
import alarm_0 from "../assets/2/0.png";
import alarm_1 from "../assets/2/1.png";
import alarm_2 from "../assets/2/2.png";
import alarm_3 from "../assets/2/3.png";
import alarm_4 from "../assets/2/4.png";
import alarm_5 from "../assets/2/5.png";
import alarm_6 from "../assets/2/6.png";
import alarm_7 from "../assets/2/7.png";
import alarm_8 from "../assets/2/8.png";
import m0 from "../assets/m0.png";
import m1 from "../assets/m1.png";
import m2 from "../assets/m2.png";
import m3 from "../assets/m3.png";
import m4 from "../assets/m4.png";
import centroid from "polygon-centroid";

export class MarkerList_Native {
    constructor(map, cb) {
        this.map = map;
        this.clickCB = cb;
        this.list = [];  //数据列表
        this.imgList = [
            [
                offline_0,
                offline_1,
                offline_2,
                offline_3,
                offline_4,
                offline_5,
                offline_6,
                offline_7,
                offline_8,
            ],
            [
                online_0,
                online_1,
                online_2,
                online_3,
                online_4,
                online_5,
                online_6,
                online_7,
                online_8,
            ],
            [
                alarm_0,
                alarm_1,
                alarm_2,
                alarm_3,
                alarm_4,
                alarm_5,
                alarm_6,
                alarm_7,
                alarm_8,
            ]
        ]; //车辆图像列表
        this.drawList = []; //绘制列表
        this.markerList = []; //自定义图标列表
        this.popup = null;
        this.popupId = -1;
        let that = this;
        this.drawEvent = function (e) {
            that._reDraw();
        };
        this.map.on('zoomend', this.drawEvent);
        this.map.on('resize', this.drawEvent);
        this.map.on('moveend', this.drawEvent);
    }
    /**
     * 增加 markerList
     * @param {Array} listArray 
     */
    push(listArray) {
        this.list = listArray;
        this._reDraw();
    }
    /**
     * 清理 markerList
     */
    remove() {
        this._clear();
        this.list.length = 0;
        this.drawList.length = 0;
        this.markerList.length = 0;
    }
    /**
     * 设定气泡内容
     * @param {*} htmlStr 
     */
    setPopupContent(htmlStr) {
        if (this.popup !== null) {
            this.popup.setContent(htmlStr);
        }
    }
    /**
     * 改变气泡位置
     * @param {*} element 
     */
    _setPopupLatLng(element) {
        if (element.id === this.popupId) {
            if (this.popup !== null) {
                this.popup.setLatLng([element.lat, element.lng]);
                if (this.clickCB) {
                    this.clickCB(element.id);
                }
            }
        }
    }
    /**
     * 清理
     */
    _clear() {
        while (this.markerList.length > 0) {
            const element = this.markerList.shift();
            element.off();
            L.DomUtil.remove(element._icon);
            element.remove();
        }
    }
    /**
     * 重绘
     */
    _reDraw() {
        let that = this;
        this._clear();
        if (this.list && this.list.length > 0) {
            this._cluster();
            this._draw();
        }
    }
    /**
     * 计算集群
     */
    _cluster() {
        const basicSize = 34;
        const maxZoom = 20;
        const zoom = this.map.getZoom();
        const size = this.map.getSize();
        const viewBounds = L.bounds([0, 0], [size.x, size.y]);
        const boxSize = Math.floor((maxZoom - zoom) / 2) * basicSize;
        const xCount = Math.ceil(size.x / boxSize);
        const yCount = Math.ceil(size.y / boxSize);
        const boxList = [];
        for (let i = 0; i < xCount; i++) {
            for (let j = 0; j < yCount; j++) {
                const start = [i * boxSize, j * boxSize];
                const end = [(i + 1) * boxSize, (j + 1) * boxSize];
                const bounds = L.bounds(start, end);
                boxList.push({
                    bounds,
                    list: [],
                    one: null,
                });
            }
        }
        this.list.forEach(element => {
            let point = this.map.latLngToContainerPoint([element.lat, element.lng]);//地理坐标点转换到容器像素点
            if (viewBounds.contains(point)) { //视界内的点进行绘制
                boxList.forEach(item => {
                    if (item.bounds.contains(point)) { //点在box内
                        item.list.push(point);
                        item.one = element;
                    }
                });
            }
        });
        this.drawList.length = 0;
        boxList.forEach(item => {
            const size = item.list.length;
            if (size > 0) {
                const obj = {};
                item.list = item.list.reduce(function (item, next) { //去重,不然计算质心会出错
                    obj[next.x] ? '' : obj[next.x] = true && item.push(next);
                    return item;
                }, []);
                const center = centroid(item.list);//获取多边形质心
                const latlng = this.map.containerPointToLatLng([center.x, center.y]);
                this.drawList.push({
                    size,
                    latlng,
                    one: item.one,
                });
            }
        });
    }
    /**
     * 获取元素图标
     * @param {*} one 
     */
    _getIcon(one) {
        let direction = parseInt(one.direction ? one.direction : 0); // 方向
        let intAngle = parseInt(direction);
        while (intAngle > 360) {
            intAngle = intAngle - 360;
        }
        direction = Math.floor((intAngle + 22) / 45);
        let img = this.imgList[one.state][direction];
        //绘制图标
        let myIcon = L.divIcon({
            className: 'myIconClass',
            html: "<div align='center' style='margin-top:-25px;margin-left:-45px;width:100px;'><span style='display:block;width:100px'>" + one.text + "</span><img src=" + img + "></img></div>"
        });
        return myIcon;
    }
    /**
     * 更新一个图标
     * @param {*} one 
     */
    updateIcon(one) {
        this.markerList.forEach(element => {
            if (element.customid === one.id) {
                const myIcon = this._getIcon(one);
                element.setIcon(myIcon);
            }
        });
    }
    /**
     * 绘制
     */
    _draw() {
        this.drawList.forEach(item => {
            if (item.size === 0) {

            } else if (item.size === 1) {//常规绘制
                const myIcon = this._getIcon(item.one);
                const marker = L.marker(item.latlng, { icon: myIcon }).addTo(this.map);
                const that = this;
                marker.customid = item.one.id;
                marker.on('click', (e) => {
                    if (that.popup !== null) {
                        that.popup.remove();
                    }
                    that.popup = L.popup()
                        .setLatLng(e.latlng)
                        .setContent('...加载中...')
                        .openOn(that.map);
                    that.popupId = item.one.id;
                    if (that.clickCB) {
                        that.clickCB(item.one.id);
                    }
                });
                this.markerList.push(marker);
                //气泡
                this._setPopupLatLng(item.one);
            } else {//集群绘制
                let style = "text-align:center;";
                if (item.size <= 1000) {
                    style += "margin-top:-26px;margin-left:-26px;width:53px;height:52px;line-height:52px;background:url(" + m0 + ") no-repeat;"
                } else if (item.size <= 2000) {
                    style += "margin-top:-27px;margin-left:-28px;width:56px;height:55px;line-height:55px;background:url(" + m1 + ") no-repeat;"
                } else if (item.size <= 4000) {
                    style += "margin-top:-32px;margin-left:-33px;width:66px;height:65px;line-height:65px;background:url(" + m2 + ") no-repeat;"
                } else if (item.size <= 8000) {
                    style += "margin-top:-38px;margin-left:-39px;width:78px;height:77px;line-height:77px;background:url(" + m3 + ") no-repeat;"
                } else {
                    style += "margin-top:-44px;margin-left:-45px;width:90px;height:89px;line-height:89px;background:url(" + m4 + ") no-repeat;"
                }
                //绘制图标
                let myIcon = L.divIcon({
                    className: 'myIconClass',
                    html: "<div style='" + style + "'>" + item.size + "</div>"
                });
                const marker = L.marker(item.latlng, { icon: myIcon }).addTo(this.map);
                this.markerList.push(marker);
            }
        });
    }
}