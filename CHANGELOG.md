### Homebridge-myplace - An independent plugin for Homebridge bringing Advantage Air MyPlace system, its smaller siblings (E-zone, MyAir, MyAir4, etc) and its cousins (e.g. Fujitsu AnywAir) to Homekit

##### v2.4.0 (08-03-2026)
##### Resolved HomeKit crash when accessing the Thermostat after AUTO mode was previously set:
##### (1) Removed the use of Thermostat AUTO mode as a proxy for Dry mode.
##### (2) Removed the FanSpeed control from the Thermostat accessory.
##### (3) Introduced a new dedicated Switch accessory with FanSpeed control to reliably activate Dry mode without impacting Thermostat stability.
