// libs
import AsyncStorage from "@react-native-async-storage/async-storage";

// local
import { alarmStorage } from "./constants";
import { Alarm as AlarmType, ID } from "../Types";

export const getAlarms = async (): Promise<AlarmType[] | []> => {
  const storage = await AsyncStorage.getItem(alarmStorage);

  if (storage && storage.length > 0) {
    return JSON.parse(storage) as AlarmType[];
  } else {
    return [];
  }
};

export const getAlarmById = async (id: ID) => {
  if (!id) {
    throw new Error("Please enter an id");
  }

  const storage = await AsyncStorage.getItem(alarmStorage);
  if (storage && storage.length > 0) {
    const parsedStorage = JSON.parse(storage) as AlarmType[];
    const alarm = parsedStorage.find((storageAlarm) => storageAlarm.id == id);
    if (alarm) {
      return alarm;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

