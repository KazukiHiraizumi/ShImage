#!/usr/bin/python

import os
import cv2
import numpy as np
import roslib
import rospy
from rovi.srv import ImageFilter
from std_msgs.msg import Header
from sensor_msgs.msg import Image
from cv_bridge import CvBridge, CvBridgeError

rospy.init_node("impub", anonymous=True)

bridge=CvBridge()
pub1=rospy.Publisher("/shm/image_in",Image,queue_size=1)

img0=cv2.imread("phase_0.pgm")
img=cv2.cvtColor(img0,cv2.COLOR_BGR2GRAY)

cv2.imshow("img",img)

imgr=bridge.cv2_to_imgmsg(img, "mono8")
hdr=Header()
try:
  rospy.loginfo("__pub__");
  pub1.publish(imgr)
  rospy.loginfo("__done__");
except CvBridgeError, e:
  print e

#try:
#  rospy.spin()
#except KeyboardInterrupt:
#  print "Shutting down"
