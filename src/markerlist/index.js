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
import offline from "../assets/0.png";
import online from "../assets/1.png";
import alarm from "../assets/2.png";

export class MarkerList {
    constructor(map, canvas, cb) {
        this.map = map;
        this.canvas = canvas;
        this.clickCB = cb;
        this.boundsList = [];
        this.popup = null;
        this.popupId = -1;
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
    remove() {
        this.list.length = 0;
        this._clear();
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
                    if (that.popup !== null) {
                        that.popup.remove();
                    }
                    that.popup = L.popup()
                        .setLatLng(latlng)
                        .setContent('...加载中...')
                        .openOn(that.map);
                    that.popupId = element.ele.id;
                    if (that.clickCB) {
                        that.clickCB(element.ele.id);
                    }
                }
            });
        });
    }
    /**
     * 清理
     */
    _clear() {
        let size = this.map.getSize();
        this.ctx.clearRect(0, 0, size.x, size.y);
        this.boundsList.length = 0;
    }
    /**
     * 重绘
     */
    _draw() {
        let that = this;
        this._clear();
        if (this.list && this.list.length > 0) {
            this.list.forEach(element => {
                that._drawArc(element);
                that._drawText(element);
                that._setPopupLatLng(element);
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
        let boundWidth = 0;
        this.boundHeight = 0;
        if (element.direction != undefined) {
            let img = new Image();
            let imgWidth = 24;
            let imgHeight = 24;
            let direction = parseInt(element.direction);
            let that = this;
            boundWidth = imgWidth / 2;
            this.boundHeight = imgHeight / 2;
            img.onload = function () {
                that.ctx.translate(point.x, point.y);
                if (direction <= 0 || direction >= 360) {
                    that.ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2);
                } else {
                    let angle = 0;
                    if (direction > 0 && direction <= 180) {
                        angle = Math.PI * direction / 180;
                    } else {
                        angle = Math.PI * (direction / 180 - 2);
                    }
                    that.ctx.rotate(angle);
                    that.ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2);
                    that.ctx.rotate(-angle);
                }
                that.ctx.translate(-point.x, -point.y);
            };
            switch (element.state) {
                case 0: img.src = offline; break; //离线
                case 1: img.src = online; break; //在线
                case 2: img.src = alarm; break; //报警
                default:
                    break;
            }
        } else {
            this.radius = 6;  //圆圈半径
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.arc(point.x, point.y, this.radius, 0, 2 * Math.PI);
            switch (element.state) {
                case 0: this.ctx.fillStyle = "#D8D8D8"; break; //离线
                case 1: this.ctx.fillStyle = "#82FA58"; break; //在线
                case 2: this.ctx.fillStyle = "#FE2E2E"; break; //报警
                default:
                    break;
            }
            this.ctx.fill();
            this.ctx.stroke();
            boundWidth = this.radius;
            this.boundHeight = this.radius;
        }

        let bounds = L.bounds([[point.x - boundWidth, point.y - this.boundHeight], [point.x + boundWidth, point.y + this.boundHeight]]);
        this.boundsList.push({
            ele: element,
            bounds: bounds,
        });
    }
    /**
     * 画车牌
     * @param {object} element 
     */
    _drawText(element) {
        let point = this.map.latLngToLayerPoint([element.lat, element.lng]);
        point = this.map.layerPointToContainerPoint(point);
        let width = element.text.length * 5;
        let height = 10;
        let x = point.x - width / 2;
        let y = point.y - this.boundHeight - height - 2;
        //框部分2
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x, y, width, height);
        //字体部分
        this.ctx.font = "7px";
        this.ctx.strokeStyle = '#000000';
        this.ctx.strokeText(element.text, x, y + height, width);
    }
}