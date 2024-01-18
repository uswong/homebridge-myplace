
<p align="center">
<img src="https://github.com/homebridge/branding/blob/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">
<img src="Screenshots/AdvAirLogo.png" width="220">
</p>

<span align="center">
  
[![npm](https://badgen.net/npm/v/homebridge-cmd4-advantageair/latest?icon=npm&label)](https://www.npmjs.com/package/homebridge-cmd4-advantageair)
[![npm](https://badgen.net/npm/dt/homebridge-cmd4-advantageair?label=downloads)](https://www.npmjs.com/package/homebridge-cmd4-advantageair)
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
  
</span>

# homebridge-myplace
An independent plugin bringing Advanatge Air MyPlace System to Homekit.

This plugin is a result of blending together, with modifications to make it more efficient, the [homebridge-cmd4-AdvantageAir](https://github.com/mitch7391/homebridge-cmd4-AdvantageAir) plugin v3.11.0 and the [homebridge-cmd4](https://github.com/mitch7391/homebridge-cmd4) plugin v7.0.2. 

## Supported Advantage Air Control Units:
  * [MyPlace](https://apps.apple.com/au/app/myplace/id996398299)
  * [MyAir4](https://apps.apple.com/au/app/myair4/id925994861)
  * [MyAir](https://apps.apple.com/au/app/myair/id481563583)
  * [E-zone](https://apps.apple.com/au/app/e-zone/id925994857)
  * [Fujitsu anywAIR](https://apps.apple.com/au/app/anywair/id1509639853)

## Installation:
### Raspbian/HOOBS/macOS/NAS:
1. Install Homebridge via these instructions for [Raspbian](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian), [HOOBS](https://support.hoobs.org/docs) or [macOS](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-macOS), if you have not already.

2. Install `homebridge-myplace` plug-in via the Homebridge UI 'plugins' tab search function.

     <p align="left">
     <img width="800px" src="Screenshots/myPlaceInstall.png">
     </p>
3. Check if <B>jq</B> and <B>curl</B> are installed (<B>curl</B> should already be):
```shell
jq -V
curl -V
```
If they are installed, the above command should return a version number.

4. If not already, install <B>jq</B> and <B>curl</B> via your Homebridge UI terminal or through ssh: 
```shell
# Raspbian/Hoobs:
sudo apt-get install <jq or curl>

# macOS:
brew install <jq or curl>

# Synology NAS:
apt-get install <jq or curl>

# QNAP NAS:
apk add <jq or curl>
```


4. Create your Homebridge `config.json`
   
  Go to the 'Plugins' tab in Homebridge UI, locate your newly installed `Homebridge Myplace` plugin and click the three dots on the bottom right, select `Plugin Config` and it should launch the 'Configuration Creator and Checker' and `Device Settings` page.
     <p align="left">
     <img width="800px" src="Screenshots/AdvAirConfigCreator.png">
     </p>

   In 'Device Settings' area, fill out the `Name`, `IP Address` and `PORT used` fields (default PORT is `2025` for most users, Fujitsu anywAIR users set this to `10211` ) and check/uncheck the checkboxes for `extra timers` and `debug`. Then press the `Create CONFIGURATION` button to create the required configuration file.  On a sucess, click `CHECK CONFIGURATION`to check the configuration file just created to make sure everything is in order. On a success it will say `Passed`; if something is incorrect, an error message will pop up telling you what needs to be fixed.

     <p align="left">
     <img width="300px" src="Screenshots/AdvAirShellCheckPassed.png">
     </p>

     <p align="left">
     <img width="600px" src="Screenshots/AdvAirShellCheckError.png">
     </p>
     
* HOOBS users who do not have access to Homebridge UI (for now!) will have to run the Config Creator on a terminal:
```shell
   cd
   <Plugin path>/homebridge-myplace/ConfigCreator.sh
```
  then follow the on-screen instructions.

6. Restart Homebridge to get your Homebridge Myplace plugin up and running for you.
   
## How You Can Help:
* Report Bugs/Errors by opening Issues/Tickets.
* Suggest Improvements and Features you would like to see!


## Special Thanks
1. Many thanks to [John Talbot](https://github.com/ztalbot2000) for his fantastic [homebridge-cmd4](https://github.com/mitch7391/homebridge-cmd4) plugin which I have forked and used it as the main engine for this plugin.
2. Many thanks also to [Mitch Williams](https://github.com/mitch7391) who has created the wonderful [homebridge-cmd4-AdvantageAir](https://github.com/mitch7391/homebridge-cmd4-AdvantageAir) plugin and has allowed me to participate in its development. 
3. And never forget to thank my beautiful wife who has put up with my obsession on this.....


## LICENSE:
This plugin is distributed under the MIT license. See [LICENSE](https://github.com/mitch7391/cmd4-E-Zone-MyAir/blob/master/LICENSE) for details.
