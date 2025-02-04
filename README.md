# KinhWeb-Go
百度网盘在线仓库,使用Go编写.

## 安装使用  
目前支持Linux与Windows部署,其他平台请自行编译运行.  
在``config.yaml``文件下填写``user``部分信息.  

```yaml
user:
  #百度账号BDUSS,建议使用网页版Cookie
  bduss:
  #对下载无明显影响,可以不改
  is_vip: 0
  #奇妙小链接,不清楚就留空
  acclink:
```

如果您想修改标题界面,可以修改如下内容.您也可以自行开发主题放于``templates``目录下.
```yaml
system:
    bind_port: 8080
    bind_host: 0.0.0.0
    version: 1.0.0
    #使用的主题
    theme: weui
    #网站标题
    title: KinhWeb
    #网站页脚
    foot: ""
    debug: false
```

## 功能
### V1.0.0版本
    1. 支持文件列表查看
    2. 支持文件下载
    3. 支持自定义主题

## FaQ
如果有任何使用问题请在群组[@KinhWeb](https://t.me/kinhweb)提出,或者在本仓库下提交Issue.  
关注频道[@KinhWebPD](https://t.me/kinhwebpd)获取最新更新信息.  

## License
GPL-2.0 license
