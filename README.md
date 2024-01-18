
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
A Plugin bringing Advanatge Air MyPlace system to Homekit

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

4. Install <B>jq</B> via your Homebridge UI terminal or through ssh: 
```shell
# Raspbian/Hoobs:
sudo apt-get install jq

# macOS:
brew install jq

# Synology NAS:
apt-get install jq

# QNAP NAS:
apk add jq
```
5. Check if <B>curl</B> is installed (it should already be):
```
curl -V
```
6. If <B>curl</B> does not return a version number, install via:
```shell
# Raspbian/Hoobs:
sudo apt-get install curl

# macOS:
brew install curl

# Synology NAS:
apt-get install curl

# QNAP NAS:
apk add curl
``` 
6. Create your Homebridge `config.json`:
  Go to the 'plugins' tab in Homebridge UI and locate your newly installed `Homebridge Myplace`. Click the three dots on the bottom right, select `Plugin Config` and it should launch the 'Configuration Creator and Checker' and `Device Setting` page.
     <p align="left">
     <img width="800px" src="Screenshots/AdvAirConfigCreator.png">
     </p>

   In 'Device Settings' area and fill out the `Name`, `IP Address` and `PORT used` fields (default PORT is `2025` for most users, Fujitsu anywAIR users set this to `10211` ) and check/uncheck your preferred setup options, then press the `Create CONFIGURATION` button to create the required configuration file. then click `CHECK CONFIGURATION`to check over the configuration file just created to make sure you have everything correct. On a success it will say `Passed`; if something is incorrect, an error message will pop up telling you what needs to be fixed.

     <p align="left">
     <img width="300px" src="Screenshots/AdvAirShellCheckPassed.png">
     </p>

     <p align="left">
     <img width="600px" src="Screenshots/AdvAirShellCheckError.png">
     </p>
     
* HOOBS users do not have access to our Homebridge UI (for now!) and will have to use the following terminal instructions:
  cd
  <Plugin path>/homebridge-myplace/ConfigCreator.sh
  
## How You Can Help:
* Open Issues/Tickets.
* Report Bugs/Errors.
* Suggest Improvements and Features you would like to see!


## Special Thanks
1. Many thanks to [Mitch Williams](https://github.com/mitch7391) who has created the wonderful [homebridge-cmd4-AdvantageAir](https://github.com/mitch7391/homebridge-cmd4-AdvantageAir) plugin and has allowed me to participate in its development and in the process I have leant a lot on **bash** and **javascript** coding in homebridge environment.
2. Many thanks also to [John Talbot](https://github.com/ztalbot2000) for his fantastic [homebridge-cmd4](https://github.com/mitch7391/homebridge-cmd4) plugin which I have forked and used it as the power engine for this plugin.
3. And never forget to thank my beautiful wife who has put up with my obsession on this.....


## LICENSE:
This plugin is distributed under the MIT license. See [LICENSE](https://github.com/mitch7391/cmd4-E-Zone-MyAir/blob/master/LICENSE) for details.
