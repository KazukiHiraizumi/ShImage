#!/usr/bin/env node

const ros = require('rosnodejs');
const sensor_msgs = ros.require('sensor_msgs').msg;
const fs = require('fs');
const topic = 'image_raw';
const rovi_srvs = ros.require('rovi').srv;
const std_msgs = ros.require('std_msgs').msg;
const shm = require('../shm-typed-array');

function imgCreate(param) {
  let img = new sensor_msgs.Image();
  img.header.seq = 0;
  img.header.stamp = 0;
  img.header.frame_id = 'camera';
  img.width = 1280;
  img.height = 1024;
  img.step = 1280;
  img.encoding = 'mono8';
  for (let key in img) {
    if (param.hasOwnProperty(key)) {
      img[key] = param[key];
    }
  }
  imgLength = img.height * img.step;
  return img;
}

setImmediate(async function(){
  const rosNode=await ros.initNode('shm_server');
  const pub=rosNode.advertise('/shm/image_out', sensor_msgs.Image);
  let shmem;
  let key=0;

  let srv=rosNode.advertiseService('/shm/recv', rovi_srvs.ImageFilter,function(req){
    const buffer=Buffer.from(req.img.data);
    const nkey=buffer.readUInt32LE(0);
    const res=new rovi_srvs.ImageFilter.Response();
    res.img=req.img;
    ros.log.info("__srv__"+nkey);
    if(nkey!=key){
      try{
        if(key!=0) shm.detach(key);
        shmem=shm.get(key=nkey,'Uint8Array');
      }
      catch(err){
        console.log('get:'+err);
      }
    }
    req.img.data=shmem;
    pub.publish(req.img);
    return res;
  });
});
