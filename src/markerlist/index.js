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
export class MarkerList {
    constructor(map, canvas, cb) {
        this.map = map;
        this.canvas = canvas;
        this.clickCB = cb;
        this.boundsList = [];
        this.ctx = canvas.getContext('2d');
        let that = this;
        this.drawEvent = function (e) {
            that._draw();
        };
        this.map.on('zoomend', this.drawEvent);
        this.map.on('resize', this.drawEvent);
        this.map.on('moveend', this.drawEvent);
        this._addClickEvent();
    }
    /**
     * 增加 markerList
     * @param {Array} listArray 
     */
    push(listArray) {
        this.list = listArray;
        this._draw();
    }
    /**
     * 清理 markerList
     */
    clear() {
        this.list.length = 0;
        this._draw();
    }
    /**
     * 设定气泡内容
     * @param {*} htmlStr 
     */
    setPopupContent(htmlStr) {
        this.popup.setContent(htmlStr);
    }
    /**
     * 增加点击事件监听
     */
    _addClickEvent() {
        let that = this;
        this.canvas.addEventListener('click', function (e) {
            let x = e.layerX;
            let y = e.layerY;
            let point = [x, y];
            that.boundsList.forEach(element => {
                if (element.bounds.contains(point)) {
                    let latlng = that.map.containerPointToLatLng(point);
                    that.popup = L.popup()
                        .setLatLng(latlng)
                        .setContent(element.ele.text)
                        .openOn(that.map);
                    if (that.clickCB) {
                        that.clickCB(element.ele);
                    }
                }
            });
        });
    }
    /**
     * 重绘
     */
    _draw() {
        let that = this;
        let size = this.map.getSize();
        this.ctx.clearRect(0, 0, size.x, size.y);
        if (this.list && this.list.length > 0) {
            this.list.forEach(element => {
                that._drawArc(element);
                that._drawText(element);
                that.ctx.save();
            });
        }
    }
    /**
     * 画圆圈
     * @param {object} element 
     */
    _drawArc(element) {
        let point = this.map.latLngToLayerPoint([element.lat, element.lng]);
        point = this.map.layerPointToContainerPoint(point);
        this.radius = 5;  //圆圈半径
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        this.ctx.arc(point.x, point.y, this.radius, 0, 2 * Math.PI);
        let bounds = L.bounds([[point.x - this.radius, point.y - this.radius], [point.x + this.radius, point.y + this.radius]]);
        this.boundsList.push({
            ele: element,
            bounds: bounds,
        });
        switch (element.state) {
            case 0: this.ctx.fillStyle = "#D8D8D8"; break; //离线
            case 1: this.ctx.fillStyle = "#82FA58"; break; //在线
            case 2: this.ctx.fillStyle = "#FE2E2E"; break; //报警
            default:
                break;
        }
        this.ctx.fill();
        this.ctx.stroke();
    }
    /**
     * 画车牌
     * @param {object} element 
     */
    _drawText(element) {
        let point = this.map.latLngToLayerPoint([element.lat, element.lng]);
        point = this.map.layerPointToContainerPoint(point);
        const width = 40;
        const height = 10;
        const x = point.x - width / 2;
        const y = point.y - this.radius - height;
        //框部分2
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x, y, width, height);
        //字体部分
        this.ctx.font = "italic small-caps 8px";
        this.ctx.strokeStyle = '#000000';
        this.ctx.strokeText(element.text, x, y + height, width);
    }
}