(function() {
	autoResize();
}());

//兼容浏览器的事件处理程序
var EventUtil = {
	addHandler: function(element, type, handler) {
		if (element.addEventListener) {
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent) {
			element.attachEvent("on" + type, handler);
		} else {
			element["on" + type] = handler;
		}
	},
	getEvent: function(event) {
		return event ? event : window.event;
	},
	getTarget: function(event) {
		return event.target || event.srcElement;
	},
	getRelatedTarget: function(event) {
		if (event.relatedTarget) {
			return event.relatedTarget;
		} else if (event.toElement) {
			return event.toElement;
		} else if (event.fromElement) {
			return event.fromElement;
		} else {
			return null;
		}
	},
	getButton: function(event) {
		if (document.implementation.hasFeature("MouseEvents", "2.0")) {
			return event.button;
		} else {
			switch (event.button) {
				case 0:
				case 1:
				case 3:
				case 5:
				case 7:
					return 0;
				case 2:
				case 6:
					return 2;
				case 4:
					return 1;
			}
		}
	},
	getCharCode: function(event) {
		if (typeof event.charCode == "number") {
			return event.charCode;
		} else {
			return event.keyCode;
		}
	},
	getClipboardText: function(event) {
		var clipboardData = (event.clipboardData || window.clipboardData);
		return clipboardData.getData("text");
	},
	setClipboardText: function(event, value) {
		if (event.clipboardData) {
			return event.clipboardData.setData("text/plain", value);
		} else if (window.clipboardData) {
			return window.clipboardData.setData("text", value);
		}
	},
	preventDefault: function(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	},
	removeHandler: function(element, type, handler) {
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		} else if (element.detachEvent) {
			element.detachEvent("on" + type, handler);
		} else {
			element["on" + type] = null;
		}
	},
	stopPropagation: function(event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
	}
};
//Cookie相关操作
var CookieUtil = {
	get: function(name) {
		var cookieName = encodeURIComponent(name) + "=",
			cookieStart = document.cookie.indexOf(cookieName),
			cookieValue = null;
			if (cookieStart > -1) {
				var cookieEnd = document.cookie.indexOf(";", cookieStart);
				if (cookieEnd == -1) {
					cookieEnd = document.cookie.length;
				}
				cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
			}
			return cookieValue;
	},
	set: function(name, value, expires, path, domain, secure) {
		var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
		if (expires instanceof Date) {
			cookieText += "; expires=" + expires.toGMTString();
		}
		if (path) {
			cookieText += "; path=" + path;
		}
		if (domain) {
			cookieText += "; domain=" + domain;
		}
		if (secure) {
			cookieText += "; secure=" + secure;
		}
		document.cookie = cookieText;
	},
	unset: function(name, path, domain, secure) {
		this.set(name, "", new Date(0), path, domain, secure);
	}
};
//渐隐渐入处理
var FadeUtil = {
	fadeIn: function(obj) {
		var iCur = getStyle(obj, "opacity");
		if (iCur == 1) {
			return false;
		}
		var value = 0;
		clearInterval(obj.timer);
		obj.timer = setInterval(function() {
			var step = 2;
			if (value == 100) {
				clearInterval(obj.timer);
			} else {
				value += step;
				obj.style.opacity = value / 100;
			}
		}, 10);
	},
	fadeOut: function(obj) {
		var iCur = getStyle(obj, "opacity");
		if (iCur == 0) {
			return false;
		}
		var value = 100;
		clearInterval(obj.timer);
		obj.timer = setInterval(function() {
			var step = -2;
			if (value == 0) {
				clearInterval(obj.timer);
			} else {
				value += step;
				obj.style.opacity = value / 100;
			}
		}, 10);
	}
};
//Ajax相关操作
var AjaxUtil = {
	request: function(method, url, data, func) {
		var tmpArr = [];
		var tmpUrl = url;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
					func && func(xhr);
				} else {
					alert("请求失败，请不要刷新过快，稍后再试: " + xhr.status);
				}
			}
		};
		tmpUrl += (tmpUrl.indexOf("?") == -1 ? "?" : "&");
		if (data) {
			if (typeof data == "string") {
				tmpUrl += data;
			} else {
				for (var key in data) {
					if (data.hasOwnProperty(key)) {
						var name = encodeURIComponent(key);
						var value = encodeURIComponent(data[key]);
						tmpArr.push(name + "=" + value);
					}
				}
				var tmpParam = tmpArr.join("&");
				tmpUrl += tmpParam + "&" + new Date().getTime();
			}
		}
		if (method == "get") {
			xhr.open(method, tmpUrl, true);
			xhr.send(null);
		} else {
			xhr.open(method, url, true);
			xhr.send(tmpParam);
		}
	}
};
var CourseUtil = {
	get: function(page, type) {
		 var param = {
		 	pageNo: 1,
			psize: 20,
			type: 10
		}
		if (page) {
			param.pageNo = page;
		}
		if (type) {
			param.type = type;
		}
		var tab = document.querySelector(".tabs");
		var type = tab.getElementsByTagName("li");
		var course = document.querySelector(".course-list");
		var oPage = document.querySelector(".page");
		for (var i=0;i<type.length;i++) {
			type[i].index = (i + 1) * 10;
			type[i].onclick = function() {
				for (var i=0;i<type.length;i++) {
					type[i].removeAttribute("class");
				}
				oPage.innerHTML = "";
				this.setAttribute("class", "active");
				CourseUtil.get(1,this.index);
			};
		}
		AjaxUtil.request("get", "http://study.163.com/webDev/couresByCategory.htm", param, function(xhr) {
			var data = JSON.parse(xhr.responseText);
			course.innerHTML = "";
			for (var i=0;i<20;i++) {
				var tmpLi = document.createElement("li");
				var free;
				if (data.list[i]["price"] == 0) {
					free = "免费";
				} else {
					free = "¥" + data.list[i]["price"];
				}
				tmpLi.innerHTML = "<div class=\"more\">"
								+ "<img class=\"left\" src=\"" + data.list[i]["bigPhotoUrl"] + "\">"
								+ "<div class=\"right\">"
								+ "<h3>" + data.list[i]["name"] + "</h3>"
								+ "<div>" + data.list[i]["learnerCount"] + "</div>"
								+ "<span>发布者：" + data.list[i]["provider"] + "</span>"
								+ "<span>分类：" + data.list[i]["categoryName"] + "</span>"
								+ "</div>"
								+ "<p>" + data.list[i]["description"] + "</p>"
								+ "</div>"
								+ "<img src=\"" + data.list[i]["bigPhotoUrl"] + "\">"
								+ "<h3>" + data.list[i]["name"] + "</h3>"
								+ "<span>" + data.list[i]["provider"] + "</span>"
								+ "<div class=\"count\">" + data.list[i]["learnerCount"] + "</div>"
								+ "<strong>"+ free + "</strong>";
				course.appendChild(tmpLi);		
			}
			tips();
			setPage(param.pageNo, data.pagination.totlePageCount);// data.pagination.pageIndex 服务器返回的当前页
			function setPage(curPage, totalPage, size) {
				var prevPage = document.createElement("a");
				size = size || 8;
				if (curPage == 1) {
					prevPage.index = 1;
					prevPage.setAttribute("class", "prevPage");
					oPage.appendChild(prevPage);
				} else {
					prevPage.index = curPage - 1;
					prevPage.setAttribute("class", "prevPage");
					oPage.appendChild(prevPage);
				}
				if (totalPage <= size) {
					for (var i=1; i<=totalPage;i++) {
						var aPage = document.createElement("a");
						aPage.index = i;
						aPage.innerHTML = i;
						oPage.appendChild(aPage);
					}
				} else {
					for (var i=1;i<=size;i++) {
						var aPage = document.createElement("a");
						if (curPage == 1 || curPage == 2 || curPage == 3) {
							aPage.index = i;
							aPage.innerHTML = i;
							if ( i == curPage) {
								aPage.setAttribute("class", "selected");
							}
						} else if ((totalPage - curPage) == 0 || (totalPage - curPage) == 1 || (totalPage - curPage) == 2 || (totalPage - curPage) == 3 ) {
							aPage.index = totalPage - size + i;
							aPage.innerHTML = (totalPage - size + i);
							if (((totalPage - curPage) == 0 && i == size) || ((totalPage - curPage) == 1 && i == size - 1) || ((totalPage - curPage) == 2 && i == size - 2) || ((totalPage - curPage) == 3 && i == size - 3)) {
								aPage.setAttribute("class", "selected");
							}
						} else {
							aPage.index = curPage - 4 + i;
							aPage.innerHTML = curPage - 4 + i;
							if (i == 4) {
								aPage.setAttribute("class", "selected");
							}
						}
						oPage.appendChild(aPage);
					}
				}
				var nextPage = document.createElement("a");
				if (curPage == totalPage) {
					nextPage.index = totalPage;
					nextPage.setAttribute("class", "nextPage");
					oPage.appendChild(nextPage);
				} else {
					nextPage.index = curPage + 1;
					nextPage.setAttribute("class", "nextPage");
					oPage.appendChild(nextPage);
				}
				var oA = oPage.getElementsByTagName("a");
				for (var i=0; i<oA.length; i++) {
					oA[i].onclick = function() {
						curPage = this.index;
						oPage.innerHTML = "";
						CourseUtil.get(curPage);
					};
				}
			}
		});
	}
};
//用于获取元素的实际样式
function getStyle(element,name) {
	if (window.getComputedStyle) {
		return window.getComputedStyle(element)[name];
	} else {
		return element.currentStyle[name];
	}
}
//轮播图高度自适应
function autoResize() {
	var bannerImg = document.querySelector(".m-slide img");
	var newHeight = parseInt(getStyle(bannerImg, "height"));
	var silde = document.querySelector(".m-slide");
	//如果获取不到具体高度，比如IE8，就用当前视口宽度按图片比例获取高度
	if (isNaN(newHeight) || newHeight == 0) {
		newHeight = Math.round(document.documentElement.clientWidth / 3.59);
	}
	silde.style.height = newHeight + "px";
};
function getYearsLater(year) {
	var time = new Date();
	time.setFullYear(time.getFullYear() + year);
	return time;
}
window.onload = function() {
	EventUtil.addHandler(window, "resize", autoResize);
	CourseUtil.get();
};
//点击关闭顶部通知栏
(function() {
	var remind = document.querySelector(".remind");
	var tip = document.querySelector(".m-notice");
	if (CookieUtil.get("remind") == 1) {
		tip.style.display = "none";
	} else {
		EventUtil.addHandler(remind, "click", function() {
			CookieUtil.set("remind", 1, new Date(getYearsLater(1)));
			tip.style.height = 0 + "px";
			//tip.style.display = "none";
		});
	}
}());
//点击关注弹出的登陆模块
(function() {
	var followBtn = document.getElementById("follow");
	var mask = document.querySelector(".mask");
	var close = mask.querySelector(".close-btn");
	var login = mask.querySelector(".login-btn");
	var username = document.getElementById("username");
	var pwd = document.getElementById("pwd");
	var cancel = document.querySelector(".cancel")
	var followed = document.querySelector(".followed-btn");
	var fans = document.querySelector(".fans");
	var error = document.querySelector(".error");
	if (CookieUtil.get("followSuc") == 1) {
		fans.innerHTML = "粉丝 46";
		followBtn.style.display = "none";
		followed.style.display = "inline-block";
	}
	EventUtil.addHandler(followBtn, "click", function() {
		//判断是否已经登录
		if (CookieUtil.get("loginSuc") == 1) {
			loginSucces();
		} else {
			mask.style.display = "block";
			EventUtil.addHandler(close, "click", function() {
				mask.style.display = "none";
				username.value = "";
				pwd.value = "";
			});
			EventUtil.addHandler(login, "click", function() {
				var account = {
					userName: hex_md5(username.value),
					password: hex_md5(pwd.value)
				};
				if (username.value.indexOf(" ") != -1 || pwd.value.indexOf(" ") != -1) {
					error.innerHTML = "您的输入不能包含空格，请重新输入...";
				} else if (username.value.length == 0 || pwd.value.length == 0) {
					error.innerHTML = "您的输入不能为空，请重新输入...";
				} else {
					var url = "http://study.163.com/webDev/login.htm";
					AjaxUtil.request("get", url, account, function(xhr) {
						if (xhr.responseText == 1) {
							error.innerHTML = "";
							CookieUtil.set("loginSuc", 1, new Date(getYearsLater(1)));
							document.querySelector(".mask").style.display = "none";
							loginSucces();
						} else {
							error.innerHTML = "用户名或密码错误";
						}
					});
				}
			});
		}
	})
	EventUtil.addHandler(cancel, "click", function() {
		cancelFollow();
	});
	function loginSucces() {
		AjaxUtil.request("get", "http://study.163.com/webDev/attention.htm", "", function(xhr) {
			if (xhr.responseText == 1) {
				CookieUtil.set("followSuc", 1, new Date(getYearsLater(1)));
				fans.innerHTML = "粉丝 46";
				followBtn.style.display = "none";
				followed.style.display = "inline-block";
			}
		});
	}
	function cancelFollow() {
		var follow = document.getElementById("follow");
		var followed = document.querySelector(".followed-btn");
		var fans = document.querySelector(".fans");
		CookieUtil.unset("followSuc");
		fans.innerHTML = "粉丝 45";
		followed.style.display = "none";
		follow.style.display = "inline-block";
	}
}());
//轮播图模块
(function() {
	var slide = document.querySelector(".m-slide");
	var lis = slide.getElementsByTagName("li");
	var control = document.querySelector(".control");
	var btns = control.getElementsByTagName("i");
	var timer = null;
	var iNow =  0;
	fade();
	for (var i = 0; i < btns.length; i++) {
		btns[i].index = i;
		btns[i].onclick = function() {
			iNow = this.index;
			fade();
		};
	}
	autoPlay();
	slide.onmouseover = function() {
		clearInterval(timer);
	}
	slide.onmouseout = function() {
		autoPlay();
	}
	function autoPlay() {
		timer = setInterval(function() {
			iNow++;
			iNow %= lis.length;
			fade();
		},5000);
	}
	function fade() {
		for (var i = 0; i < lis.length; i++) {
			if (i != iNow) {
				FadeUtil.fadeOut(lis[i]);
				lis[i].style.zIndex = "1";
				btns[i].removeAttribute("class");
			} else {
				FadeUtil.fadeIn(lis[iNow]);
				lis[iNow].style.zIndex = "2";
				btns[iNow].setAttribute("class", "active");
			}
		}
	}
}());
//热门排行模块
(function() {
	AjaxUtil.request("get", "http://study.163.com/webDev/hotcouresByCategory.htm", "",function(xhr) {
		var data = JSON.parse(xhr.responseText);
		var list = document.querySelector(".top-list");
		for (var i=0;i<10;i++) {
			var tmpLi = document.createElement("li");
			tmpLi.innerHTML = "<div><img src=\"" + data[i]["smallPhotoUrl"] + "\"></div>"
							+ "<h4>" + data[i]["name"] + "</h4>"
							+ "<span>" + data[i]["learnerCount"] + "</span>";
			list.appendChild(tmpLi);
		}
		setInterval(function() {
			var list = document.querySelector(".top-list");
			var willBeRemove = list.firstElementChild || list.firstChild;
			list.removeChild(willBeRemove);
			if (i <= 19) {
				var tmpLi = document.createElement("li");
				tmpLi.innerHTML = "<div><img src=\"" + data[i]["smallPhotoUrl"] + "\"></div>"
								+ "<h4>" + data[i]["name"] + "</h4>"
								+ "<span>" + data[i]["learnerCount"] + "</span>";
				list.appendChild(tmpLi);
				i++;
			} else {
				i = 1;
				var tmpLi = document.createElement("li");
				tmpLi.innerHTML = "<div><img src=\"" + data[0]["smallPhotoUrl"] + "\"></div>"
								+ "<h4>" + data[0]["name"] + "</h4>"
								+ "<span>" + data[0]["learnerCount"] + "</span>";
				list.appendChild(tmpLi);
			}
		},5000);
	});
}());
//弹出视频介绍
(function() {
	var player = document.querySelector(".player-mask");
	var close = player.querySelector(".close-btn");
	var video = document.getElementById("video-player");
	var intro = document.getElementById("intro-video");
	EventUtil.addHandler(video, "click", function() {
		player.style.display = "block";
	});
	EventUtil.addHandler(close, "click", function() {
		player.style.display = "none";
		intro.pause();
	});
}());
