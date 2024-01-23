#!/bin/bash
result=$(node .homebridge/Cmd5Scripts/State.js $* 2>&1)
echo $( date ) >> /tmp/Cmd5.log
echo $* >> /tmp/Cmd5.log
echo $result | tee -a /tmp/Cmd5.log
