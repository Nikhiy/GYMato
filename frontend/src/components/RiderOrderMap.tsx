import type { IOrder } from "../types"
import {useState,useEffect} from 'react'
import {MapContainer,TileLayer,Marker,Popup,useMap} from 'react-leaflet'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import axios from "axios"
import {realtimeService} from '../main'

declare module "leaflet"{
    namespace Routing {
        function control(optiins:any):any;
        function osrmv1(options?:any):any

    }
}

const riderIcon=new L.DivIcon({
    html:"🚗"
})

interface Props{
    order:IOrder;
}


const RiderOrderMap = ({order}:Props) => {
  return <div>Hello</div>
}

export default RiderOrderMap
