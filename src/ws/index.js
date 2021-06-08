import SocketClusterWrapper from "./SocketClusterWrapper";
import SocketIOWrapper from "./SocketIOWrapper";

import { WS_FRAMEWORKS } from "@/constants/WebSockets";

export function getSocketWrapper () {
    switch(process.env.gameSocketFramework) {
        case WS_FRAMEWORKS.SOCKET_CLUSTER: {
            return SocketClusterWrapper;
        };
        case WS_FRAMEWORKS.SOCKET_IO: {
            return SocketIOWrapper;
        };
        default: {
            return SocketClusterWrapper;
        };
    } 
};