#!/usr/bin/env node

const ros = require('rosnodejs');
const sensor_msgs = ros.require('sensor_msgs').msg;
const fs = require('fs');
const topic = 'image_raw';
const rovi_srvs = ros.require('rovi').srv;
const std_msgs = ros.require('std_msgs').msg;
const shm = require('../shm-typed-array');

setImmediate(async function(){
  const rosNode = await ros.initNode('imsub');
  let block=null;

  const cli=rosNode.serviceClient('/shm/recv',rovi_srvs.ImageFilter, { persist: true });
  if (!await rosNode.waitForService(cli.getService(), 2000)){
    ros.log.error('no service');
  }
  const pub=rosNode.advertise('/shm/image_in',sensor_msgs.Image);
  let sub1=rosNode.subscribe('/shm/image_in', sensor_msgs.Image,async function(img){
    if(block==null){
      block=shm.create(img.data.byteLength,'Uint8Array');
    }
    let shmem;
    try{
      shmem=shm.get(block.key,'Uint8Array');
      shmem.set(img.data);
    }
    catch(err){
      console.log('get:'+err);
    }

    const req=new rovi_srvs.ImageFilter.Request();
    req.img=img;
    req.img.data=new Uint8Array(4);
    const buffer=Buffer.from(req.img.data.buffer);
    buffer.writeUInt32LE(block.key,0);
    ros.log.info("__call__"+buffer.readUInt32LE(0));
    await cli.call(req);
    ros.log.info("__ret__");
  });
});
