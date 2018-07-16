# ShImage
ROS Image message trick testing 
mak
## Testing  
Ordinaly Image message contains bitmap image as "data". The message passing of ROS is implemented by TCP server-client model, so larger image makes slower message passing. This trick gives shared memory key(only 4 bytes) instead of real image data. The speed is dramatically improved.

1. Run service.js
2. Run client.js
3. Run impub.js
