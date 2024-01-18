
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
     
* HOOBS users do not have access to our Homebridge UI (for now!) and will have to use the following [terminal instructions](https://github.com/mitch7391/homebridge-cmd4-AdvantageAir/wiki/Config-Creation#hoobs-terminal-instructions).

8. 
12. If you have Cmd4 v7.0.0-beta2 or v7.0.1 or v7.0.2 installed, an optimised version of `Cmd4PriorityPollingQueue.js` module which will give you some improvements in performance, will be installed as part of the ConfigCreator process at step 10.
    
    A feedback messages from ConfigCreator of "COPIED and DONE!" is an indication of sucessful installation.

    A feedback messages from ConfigCreator of "NOT COPIED but DONE!" is an indication of unsucessful installation of the optimised module but the config was generated sucesscully. If this happens, a script `copyEnhancedCmd4PriorityPollingQueueJs.sh` will be created in `<config.json storage path>` directory and you can run it to get it installed manually.

    The `<config.json storage path>` directory is the directory where "config.json" is stored.  For Raspbian installation, it is typically `/var/lib/homebridge`.  For Mac users, it is typically `$HOME/.homebridge`. For HOOBS users, it is typically `/var/lib/hoobs/<bridge>`.

    Restart homebridge for the change to take effect.

    *Please note that if this optimised version of `Cmd4PriorityPollingQueue.js` module is not installed, this plugin will still work fine but slightly less efficient.*
    
### Windows OS
I have not successfully set this up on a Windows OS Homebridge server yet. If you have and want to contribute; please reach out and let me know how you did it. Otherwise I strongly suggest you buy a dedicated Raspberry Pi for Homebridge.


## Further Notes
You can read more about this project and how to create your config on the [Wiki](https://github.com/mitch7391/homebridge-cmd4-AdvantageAir/wiki) page.


## How You Can Help:
* Open Issues/Tickets.
* Report Bugs/Errors.
* Suggest Improvements and Features you would like to see!
* Help test the beta releases! See the [Wiki](https://github.com/mitch7391/homebridge-cmd4-AdvantageAir/wiki#beta-testing) to find out how to 'sign up'.  
* Create a fork, add or fix something yourself and create a Pull Request to be merged back into this project and released!
* Let me know if you have a Control Unit or App that works that is not confirmed in my [Supported List](https://github.com/mitch7391/cmd4-AdvantageAir#supported-control-units)!
* Let me know if you can figure out how to get this running on Windows 10/11 Homebridge.
* Feel free to let me know you are loving the project by give me a `Star`! It is nice to have an idea how many people use this project! 


## Special Thanks:
1. The evolution, improvements and continuously tireless work of [John Talbot](https://github.com/ztalbot2000), who has not only improved these shell scripts beyond measure and created the Homebridge UI integration; but continues to improve [homebridge-cmd4](https://github.com/ztalbot2000/homebridge-cmd4) to further cater to this work and my end users.
2. The hard work and valued coding experince of [Ung Sing Wong](https://github.com/uswong) that has led to the many amazing features in a short space of time; and no doubt more to come in the future!
3. This would never have kicked off without the patience and kindness of [TimofeyK](https://github.com/TimofeyK) helping out a new starter find his feet.
4. Lastly, but certainly not least, is my beautiful Wife who has put up with what has become an obsession of mine to get our air conditioner and many other devices into Homekit. May she forever be misunderstood by Siri for my amusement...


## LICENSE:
This plugin is distributed under the MIT license. See [LICENSE](https://github.com/mitch7391/cmd4-E-Zone-MyAir/blob/master/LICENSE) for details.
