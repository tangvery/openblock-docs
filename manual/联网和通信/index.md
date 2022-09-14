MQTT

---

为了达到万物互联、自动发现 等效果。设计消息系统。

broker:消息调度和转发中心，每个网络有一个broker集群，包含一个或更多broker节点。跨层级网络之间通过broker转发。
broker的关系类似于路由，具有层级的树状关系。每个可发现环境，有唯一的中心broker集群（或单点）。
broker可由不同语言或形式组织，如nodejs甚至js in browser、C#等。
broker可以以网络服务形似部署在公网或局域网中，也可以部署在浏览器的页面中，比如OpenBlockIDE。
每个broker在其父节点中具有唯一的ID/Path。

client：与broker连接的终端程序。

broker与broker和client与broker之间通过tcp、 udp、 http、 蓝牙、 进程间通信、 或web内部消息 等协议通信，不强制要求具体通信方式，实现可以自由定义。


broker 可选支持本地广播功能。本地广播只会讲消息广播到直接连接到broker的broker或client。
clicnt 要求通过指定broker发出广播。
broker 提供设备发现服务。

broker可以以P2P方式自行组网。

无法建立中心broker的情况，client可携带p2pbroker，实现自行组网。
平等节点中动态选举出主broker。

为了支持可配置的链接方式，将通信模块以 语言-实现-端 方式命名。
如： 
js-tcp-server
js-tcp-client
js-udp-client
csharp-tcp-server

协议内容：
1 创建连接

2 client经由broker向其他client发送消息
消息头：发出消息的client path，目标client的path

3 client向broker连接的其他client广播
