var getData = function(stars, lv) {
        return system[lv] && system[lv].stars[stars] || false;
    }
    Equip = function(lv, stars, forDrawer, debug) {
        this.debug = debug || false;
        this.lv = lv || 150;
        this.stars = stars || 0;
        this.forDrawer = forDrawer || false;
        this.destroy = 0;
        this.total = 0;
        this.destroyStars = [];
        this.track = [];
        this.count = 0;
        this.fallCount = 0;
        // console.log('this.lv' + this.lv)
        this.upStar = function(aegis, event) {
            var r = Math.random() * 1,
                v = 0,
                a = getData(this.stars, this.lv);
            if (a) {
                this.total += a[TYPES.VALUE];
                if (event && [5, 10, 15].indexOf(this.stars) > -1) {
                    this.stars++;
                    this.fallCount = 0;
                } else {
                    if (this.stars >= system[this.lv].destroy && this.stars < system[this.lv].aegisVoid && aegis) {
                        this.total += a[TYPES.VALUE];
                    }
                    if (this.fallCount >= 2 || (r -= a[TYPES.SUCCESS]) < 0) {
                        this.stars++;
                        this.fallCount = 0;
                    } else if ((r -= a[TYPES.KEEP]) < 0) {
                        this.fallCount = 0;
                    } else if ((r -= a[TYPES.FALL]) < 0) {
                        this.stars--;
                        this.fallCount++;
                    } else if ((r -= a[TYPES.BROKEN]) < 0 && (this.stars >= system[this.lv].aegisVoid || !aegis)) {
                        if (!this.forDrawer) {
                            if (this.destroyStars.length > 5000) {
                                this.destroyStars.shift();
                            };
                            this.destroyStars.push(this.stars + ' ');
                        };
                        this.stars = system[this.lv].destroy;
                        this.total += system[this.lv].value;
                        this.fallCount = 0;
                        this.destroy++;
                    };
                }
                this.count++;
                if (!this.forDrawer) {
                    if (this.track.length > 5000) {
                        this.track.shift();
                    };
                    this.track.push(this.stars + ' ');
                }
                // console.log("★" + this.stars + "\t Destroy:" + this.destroy + "\t" + this.total.toLocaleString());
                return this;
            };
        }
        this.toStar = function(star, aegis, aegisOpen, event, roll) {
            while (this.stars < star) {
                var i = roll || 0;
                while (i > 0) {
                    var r = Math.random() * 1;
                    if (r > 0.3) {
                        i--;
                    } else {
                        i = roll || 0;
                    }
                }
                this.upStar((aegisOpen && this.stars >= aegisOpen) ? (aegis || false) : false, event);
            }
            if (this.debug) {
                console.log(this.track);
                console.log(this.destroyStars);
                console.log('this.toStar(' + star + ',' + aegis + ',' + aegisOpen + ',' + roll)
                console.log("★" + this.stars + "\t Destroy:" + this.destroy + "\t" + this.total.toLocaleString());
            };
            return this;
        }
        this.clear = function(lv, stars) {
            this.lv = lv || 150;
            this.stars = stars || 0;
            this.destroy = 0;
            this.total = 0;
            this.destroyStars = [];
            this.track = [];
            this.count = 0;
            this.fallCount = 0;
            this.forDrawer = forDrawer || false;
        }
    }
    var toOnce = function() {
        var lv = document.getElementById('lv').value || 150,
            star = parseInt(document.getElementById('star').value || 17, 10),
            currentStar = parseInt(document.getElementById('currentStar').value || 0, 10),
            aegis = document.getElementById('aegis').checked || false,
            lucky = document.getElementById('lucky').checked || false,
            equip = (new Equip(lv, currentStar)).toStar(star, aegis, document.getElementById('save').value, lucky);
        document.getElementById('count').innerHTML = "count:" + equip.count.toLocaleString()
        document.getElementById('track').innerHTML = "history:" + equip.track.toLocaleString()
        document.getElementById('destroy').innerHTML = "destroy:" + equip.destroy.toLocaleString()
        document.getElementById('destroyStars').innerHTML = "destroyStars:" + equip.destroyStars.toLocaleString()
        document.getElementById('onceAnswer').innerHTML = "★" + document.getElementById('currentStar').value + " →★" + equip.stars + " Total:" + equip.total.toLocaleString();
    }
    var toDrawer = function() {
        var lv = document.getElementById('lv').value || 150,
            star = parseInt(document.getElementById('star').value || 17, 10),
            currentStar = parseInt(document.getElementById('currentStar').value || 0, 10),
            aegis = document.getElementById('aegis').checked || false,
            lucky = document.getElementById('lucky').checked || false,
            data = [],
            date = [],
            max = 0,
            equie = new Equip(lv, currentStar, true);
        var counts = 50000;
        for (var total = 0, i = 0; i < counts; i++) {
            var t = equie.toStar(star, aegis, document.getElementById('save').value, lucky, 0).total;
            if (t > max) { max = t };
            data[Math.round(t / 100000000)] = (data[Math.round(t / 100000000)] || 0) + 1;
            total += t;
            equie.clear(lv, currentStar, true);
        };
        // console.log(max);
        for (var flag6 = false, flag9 = false, count = 0, i = 1; i < data.length; i++) {
            date.push(i + "00m");
            count += (data[i] || 0);
            if (count > counts * 0.6 && !flag6) {
                flag6 = true;
                console.log("60%:" + i);
            };
            if (!flag9 && count > counts * 0.99) {
                flag9 = true;
                console.log("99%:" + i);
                break;
            };
        }
        var option = {
            tooltip: {
                trigger: 'axis',
                position: function(pt) {
                    return [pt[0], '10%'];
                }
            },
            title: {
                left: 'center',
                text: '50000回',
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: date
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%']
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100
            }, {
                start: 0,
                end: 100,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }],
            series: [{
                name: 'Count',
                type: 'line',
                smooth: true,
                symbol: 'none',
                sampling: 'average',
                itemStyle: {
                    normal: {
                        color: 'rgb(255, 70, 131)'
                    }
                },
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgb(255, 158, 68)'
                        }, {
                            offset: 1,
                            color: 'rgb(255, 70, 131)'
                        }])
                    }
                },
                data: data
            }]
        };
        var myChart = echarts.init(document.getElementById('main'));
        myChart.setOption(option);
    }

    window.onload = function() {
        document.getElementById('wp200').src = wp200;
        document.getElementById('wp160').src = wp160;
        document.getElementById('wp150').src = wp150;
        document.getElementById('wp140').src = wp140;
        document.getElementById('cope').src = cope;
        selectWp("150");
    }

    var selectWp = function(lv) {
        var wpList = document.getElementsByClassName('_wp');
        for (var i = 0; i < wpList.length; i++) {
            wpList[i].style.background = 'none'
        }

        maxStar = system[lv].all;
        if (lv == 200) {
            document.getElementById('wp200').style.background = 'rgba(0,0,0,0.2)'
            document.getElementById('lv').value = 200;
        } else if (lv == 160) {
            document.getElementById('wp160').style.background = 'rgba(0,0,0,0.2)'
            document.getElementById('lv').value = 160;
        } else if (lv == 150) {
            document.getElementById('wp150').style.background = 'rgba(0,0,0,0.2)'
            document.getElementById('lv').value = 150;
        } else if (lv == 140) {
            document.getElementById('wp140').style.background = 'rgba(0,0,0,0.2)'
            document.getElementById('lv').value = 140;
        } else if (lv == '150++') {
            document.getElementById('cope').style.background = 'rgba(0,0,0,0.2)'
            document.getElementById('lv').value = '150++';
        } else {
            alert('出现了神奇的bug，请联系日语君')
        }
        window.selectCurrentStar(0);
        window.selectTargettStar(maxStar - 5);
    }
    window.selectCurrentStar = function(lv) {
        if (lv >= document.getElementById('star').value) {
            alert('太大了没法玩啊：【' + lv + '】→' + document.getElementById('star').value);
            return;
        }
        document.getElementById('currentStar').value = lv;
        var strCs = '';
        for (var cs = 0; cs < maxStar - 1; cs++) {
            strCs += '<span style="font-size:16px;" onclick="selectCurrentStar(' + (cs + 1) + ')">' + (cs < lv ? '★' : '☆') + '</span>'
            if ((cs + 1) % 5 === 0) {
                strCs += '<span style="margin-left:10px;"></span>'
            }
        }
        document.getElementById('currentStarHolder').innerHTML = strCs;
    }
    window.selectTargettStar = function(lv) {
        if (lv <= document.getElementById('currentStar').value) {
            alert('太小了不行啊：' + document.getElementById('currentStar').value + '→【' + lv + '】');
            return;
        }
        document.getElementById('star').value = lv;
        var strTs = '';
        for (var ts = 0; ts < maxStar; ts++) {
            strTs += '<span style="font-size:16px;" onclick="selectTargettStar(' + (ts + 1) + ')">' + (ts < lv ? '★' : '☆') + '</span>'
            if ((ts + 1) % 5 === 0) {
                strTs += '<span style="margin-left:10px;"></span>'
            }
        }
        document.getElementById('targetStarHolder').innerHTML = strTs;
    }