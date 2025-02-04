function Aria2DownLoad(Name, DLink, UA, Split, port) {
    var Variable_WebSocket = new WebSocket('ws://localhost:' + port + '/jsonrpc');
    Variable_WebSocket.onopen = function() {
        Variable_WebSocket.send('{"jsonrpc":2,"id":"KinhWeb","method":"system.multicall","params":[[{"methodName":"aria2.addUri","params":[["' + DLink + '"],{"max-connection-per-server":"' + Split + '","split":"' + Split + '","out":"' + Name + '","user-agent":"' + UA + '","piece-length":"1M","allow-piece-length-change":"true"}]}]]}');
    }
    Variable_WebSocket.onclose = function() {
        msg('error', 'aria2c未启动');
    }

    Variable_WebSocket.onerror = function() {
        msg('error', '发送失败');
    }

    Variable_WebSocket.onmessage = function(e) {
        if (e.data.indexOf('result') != -1) {
            msg('error', '发送成功')
        }
    }
}

function getNum(str, firstStr, secondStr) {
    if (str == "" || str == null || str == undefined) {
        return "";
    }
    if (str.indexOf(firstStr) < 0) {
        return "";
    }
    var subFirstStr = str.substring(str.indexOf(firstStr) + firstStr.length, str.length);
    var subSecondStr = subFirstStr.substring(0, subFirstStr.indexOf(secondStr));
    return subSecondStr;
}

function msg(type, text) {
    if (type == 'error') {
        document.getElementById('error').innerHTML = text;
    } else {
        document.getElementById(type + 'info').innerHTML = text;
    }
    var ele = '#' + type;
    var elem = $(ele);
    if (elem.css('display') != 'none') return;
    elem.fadeIn(100);
    setTimeout(function() {
        elem.fadeOut(100);
    }, 2000);
}

function convertBytes(byteSize) {
    byteSize = Number(byteSize);
    if (byteSize < 0) {
        throw new Error("Byte size cannot be negative");
    }

    const units = ["B", "KB", "MB", "GB", "TB"];
    let index = 0;

    while (byteSize >= 1024 && index < units.length - 1) {
        byteSize /= 1024;
        index++;
    }

    return `${byteSize.toFixed(2)} ${units[index]}`;
}

function openDir(path) {
    const dir = encodeURIComponent(path);
    const apiUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}api/list?dir=${dir}`;
    document.getElementById("loadinginfo").innerHTML = '获取文件列表中';
    $('#loading').fadeIn(100);
    var data = {
        'path': path
    }
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                $('#loading').fadeOut(100);
             	msg('warn', '获取失败');
                throw new Error('网络响应异常');
            }
            return response.json();
        })
        .then(jsonData => {
            $('#loading').fadeOut(100);
            const pathParts = path.split('/').filter(part => part);
            const tablabDiv = document.getElementById('tablab');
            tablabDiv.innerHTML = `
                <div class="weui-flex__item" style="display: inline-block; margin-right: 5px;">
                    <div class="placeholder">
                        <a href="javascript:openDir('%2F');" role="button" class="weui-btn weui-btn_mini weui-btn_primary weui-wa-hotarea" title="全部文件">全部文件</a>
                    </div>
                </div>
            `;

            pathParts.forEach((part, index) => {
                const currentPath = '/' + pathParts.slice(0, index + 1).join('/');
                const displayPart = part.length > 7 ? part.substring(0, 7) + '...' : part;
                const html = `
                    <div class="weui-flex__item" style="display: inline-block; margin-right: 5px;">
                        <div class="placeholder">
                            <a href="javascript:openDir('${encodeURIComponent(currentPath)}');" role="button" class="weui-btn weui-btn_mini weui-btn_default weui-wa-hotarea" title="${part}">${displayPart}</a>
                        </div>
                    </div>
                `;
                tablabDiv.innerHTML += html;
            });
            const fileListDiv = document.getElementById('filelist');
            fileListDiv.innerHTML = '';

            if (jsonData.code !== 200 || !jsonData.data || !jsonData.data.list) {
             	msg('warn', '获取失败');
                throw new Error('无效的响应数据');
            }

            jsonData.data.list.forEach((item, index) => {
                const folderName = item.server_filename;
                const folderPath = item.path;
                const creationTime = new Date(item.local_ctime * 1000).toLocaleString();
                let fileSize = item.size;
                let fileSizeFomat = convertBytes(fileSize);
                const fileCate = item.category;
                const fsid = item.fs_id;
                let fileCateText = "其他";

                switch (fileCate) {
                    case 1:
                        fileCateText = '视频';
                        break;
                    case 2:
                        fileCateText = '音乐';
                        break;
                    case 3:
                        fileCateText = '图片';
                        break;
                    case 4:
                        fileCateText = '文档';
                        break;
                    case 5:
                        fileCateText = '应用';
                        break;
                    case 6:
                        fileCateText = '其他';
                        break;
                    case 7:
                        fileCateText = '种子';
                        break;
                    default:
                        fileCateText = '未知类型';
                        break;
                }
                let clickCommend = `javascript:openMeue('${index + 1}');`;
                const isDir = item.isdir;
                if (isDir === 1) {
                    fileSizeFomat = "---";
                    fileCateText = "文件夹";
                    clickCommend = `javascript:openDir('${encodeURIComponent(folderPath)}');`;
                }

                const html = `
                    <div class="weui-panel__bd">
                        <a aria-labelledby="js_p1m1_bd" href="${clickCommend}" class="weui-media-box weui-media-box_appmsg">
                            <div role="option" class="weui-media-box_text">
                                <strong class="weui-media-box__title">${folderName}</strong>
                                <p class="weui-media-box__desc">${fileCateText} 文件大小: ${fileSizeFomat} 创建时间: ${creationTime} 点击打开文件夹</p>
                            </div>
                        </a>
                        <div id="Info_${index + 1}" hidden>
                            <div id="File_Type_${index + 1}" value="${fileCate}"></div>
                            <div id="File_Path_${index + 1}" value="${folderPath}"></div>
                            <div id="File_Fsid_${index + 1}" value="${fsid}"></div>
                            <div id="File_Size_${index + 1}" value="${fileSize}"></div>
                            <div id="File_Filename_${index + 1}" value="${folderName}"></div>
                        </div>
                    </div>
                `;

                fileListDiv.innerHTML += html;
            });
        })
        .catch(error => {
            $('#loading').fadeOut(100);
            msg('warn', '获取失败');
            console.error('获取数据时出错:', error);
        });
}


function openMeue(num) {
    var ft = document.getElementById('File_Type_' + num).getAttribute('value');
    if (ft == '1' || ft == '2' || ft == '3') {
        if (ft == '1') {
            document.getElementById("potplayer").style = 'display';
        } else {
            document.getElementById("potplayer").style = 'display: none';
        }
        document.getElementById("player").style = 'display';
    } else if ($('#player').css('display') != 'none') {
        document.getElementById("player").style = 'display: none';
        document.getElementById("potplayer").style = 'display: none';
    }
    document.getElementById('meueid').setAttribute('value', num);
    $('#meue').fadeIn(100);
}

function getDlink(type) {
   document.getElementById("loadinginfo").innerHTML = '获取下载地址中';
    $('#loading').fadeIn(100);
    var num = document.getElementById('meueid').getAttribute('value');
    var fid = document.getElementById('File_Fsid_' + num).getAttribute('value');
    var fname = document.getElementById('File_Filename_' + num).getAttribute('value');
    var dlink = window.location.protocol + "//" + window.location.host + window.location.pathname + "api/down?fid=" + fid + '&m=.baidu.com';
    if (type == 'download') {
        window.open(dlink);
        msg('error', '获取下载地址成功');
    } else if (type == 'aria2c' || type == 'mo') {
        if (type == 'mo') {
            var port = 16800;
            Aria2DownLoad(fname, dlink, 'netdisk', 32, port);
        } else {
            var port = 6800;
            Aria2DownLoad(fname, dlink, 'netdisk', 16, port);
        }
    } else if (type == 'pot') {
        window.open('potplayer://' + dlink);
        msg('error', '获取下载地址成功');
    } else if(type == 'play'){
        msg('error', '获取下载地址成功');
        $('#loading').fadeOut(100);
        return dlink;
    } else {
        var aux = document.createElement("input");
        aux.setAttribute("value", dlink);
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
        msg('error', '已复制到粘贴板');
    }
    $('#loading').fadeOut(100);
}

function player() {
    var num = document.getElementById('meueid').getAttribute('value');
   var fid = document.getElementById('File_Fsid_' + num).getAttribute('value');
   var ft = document.getElementById('File_Type_' + num).getAttribute('value');
    var url = getDlink('play');
    msg('error', '预览准备中...');
    if (ft == 3) {
        document.getElementById('playerinfo').innerHTML = '<span id="galleryImg" alt="预览文件" role="img" class="weui-gallery__img" style="background-image: url(' + url + ');" tabindex="-1"></span>';
        $('#meue').fadeOut(100);
        $('#gallery').fadeIn(100)
    } else if (ft == 1 || ft ==2) {
        dplayer(url);
        $('#meue').fadeOut(100);
        $('#gallery').fadeIn(100);
    } else {
        msg('error', '不支持的预览格式');
    }
}

function dplayer(url) {
    var type = 'normal';
    const dp = new DPlayer({
        container: document.getElementById('playerinfo'),
        autoplay: true,
        video: {
            url: url,
            type: type,
            hotkey: true,
        }
    });
}

function closeplayer() {
    $('#gallery').fadeOut(100);
    document.getElementById('playerinfo').innerText = 'null';
}

$(function() {
   $('#iosMask').on('click', function() {
   $('#meue').fadeOut(100)
   });
});

document.addEventListener('DOMContentLoaded', function() {
    openDir('/');
});