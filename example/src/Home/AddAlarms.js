import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  Platform,
  Dimensions,
  Button,
  TouchableHighlight,
  StyleSheet
} from "react-native";
import { Actions } from "react-native-router-flux";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
import PushNotification from "react-native-push-notification";
import ModalSelector from "react-native-modal-selector";
import { uuid, Alarm, cancelAlarm, setAlarm } from "react-native-simple-alarm";

// Global
import { Convert } from "../styles";

// Components
import NavBar from "../Common/NavBar";

const { height, width } = Dimensions.get("window");
const iphoneX = height > 800;

class AddAlarm extends Component {
  state = {
    isDateTimePickerVisible: false,
    time: this.props.edit
      ? this.props.edit.time
      : moment().startOf("minute").format("hh:mm A"),
    date: this.props.edit
      ? this.props.edit.date
      : moment().startOf("minute").format(),
    message: this.props.edit ? this.props.edit.message : "",
    springSpeed: 500,
    snooze: this.props.edit ? Number(this.props.edit.snoozeTime) : 1,
    answersNeeded: this.props.edit ? Number(this.props.edit.answersNeeded) : 3,
    snoozePicker: false
  };

  componentDidMount() {
    PushNotification.checkPermissions((permissions) => {
      if (!permissions.alert) {
        alert("Please enable push notifications for the alarm to work");
      }
    });
  }

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _hideSnoozePicker = () => this.setState({ snoozePicker: false });

  _showSnoozePicker = () => this.setState({ snoozePicker: true });

  _handleDatePicked = (date) => {
    this._hideDateTimePicker();
    let time = moment(date).startOf("minute").format("hh:mm A");
    date = moment(date).startOf("minute").format();
    this.setState({
      time,
      date
    });
  };

  _addAlarm = () => {
    let { dispatch, edit } = this.props;
    let {
      time,
      date,
      message,
      snooze,
      answersNeeded,
      instrument,
      intervalType,
      gameType
    } = this.state;
    if (!time) {
      alert("Please enter a time for the alarm");
    } else {
      let id = edit ? edit.id : uuid(Platform.OS);
      if (moment(date).isBefore(moment().startOf("minute"))) {
        date = moment(date).add(1, "days").startOf("minute").format();
      }
      let alarm = new Alarm({
        id,
        active: 1,
        time,
        date,
        message,
        snoozeTime: snooze,
        answersNeeded,
        instrument,
        intervalType,
        gameType
      });
      dispatch({ type: "addAlarm", payload: alarm });
      setAlarm({
        device: Platform.OS,
        id,
        date,
        snooze,
        answersNeeded,
        message,
        instrument,
        intervalType,
        gameType
      });
      Actions.Home();
    }
  };

  _editAlarm = () => {
    let { dispatch, edit } = this.props;
    let {
      time,
      date,
      message,
      snooze,
      answersNeeded,
      instrument,
      intervalType,
      gameType
    } = this.state;
    if (!time) {
      alert("Please enter a time for the alarm");
    } else {
      let id = edit.id;
      if (moment(date).isBefore(moment().startOf("minute"))) {
        date = moment(date).add(1, "days").startOf("minute").format();
      }
      let alarm = new Alarm({
        id,
        active: 1,
        time,
        date,
        message,
        snoozeTime: snooze,
        answersNeeded,
        instrument,
        intervalType,
        gameType
      });
      cancelAlarm(Platform.OS, id);
      dispatch({ type: "editAlarm", payload: alarm });
      setAlarm({
        device: Platform.OS,
        id,
        date,
        snooze,
        answersNeeded,
        message,
        instrument,
        intervalType,
        gameType
      });
      Actions.Home();
    }
  };

  snoozeModal() {
    let { snooze } = this.state;
    let data = [{ key: 0, section: true, label: "Snooze Time" }];
    for (let i = 1; i < 60; i++) {
      data.push({
        key: i + "",
        label: i + "",
        accessibilityLabel: i + ""
      });
    }
    return (
      <View style={styles.setting}>
        <ModalSelector
          data={data}
          initValue="Select an Instrument"
          supportedOrientations={["portrait"]}
          accessible={true}
          scrollViewAccessibilityLabel={"Scrollable options"}
          cancelButtonAccessibilityLabel={"Cancel Button"}
          style={{ flex: 1 }}
          onChange={({ label }) => {
            this.setState({ snooze: label });
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between"
            }}
          >
            <Text style={{ fontSize: Convert(20) }}>Snooze</Text>

            <Text style={{ fontSize: Convert(20) }}>
              {snooze} minute{snooze > 1 ? "s" : null}
            </Text>
          </View>
        </ModalSelector>
      </View>
    );
  }

  render() {
    let { time, isDateTimePickerVisible, gameType } = this.state;
    let { edit } = this.props;

    return (
      <View style={{ display: "flex", flex: 1 }}>
        <NavBar
          title={edit ? "Edit Alarm" : "Add Alarm"}
          leftButtonIcon="left"
          onLeftButtonPress={() => Actions.Home()}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around",
            flexGrow: 1,
            backgroundColor: "white"
          }}
        >
          <View
            style={{
              flexGrow: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <View>
              <Text style={{ fontSize: Convert(80) }}>{time}</Text>
            </View>

            <View>
              <TouchableHighlight style={[styles.editButton]}>
                <Button
                  onPress={this._showDateTimePicker}
                  title="Edit"
                  accessibilityLabel="Edit Alarm"
                  color={Platform.OS === "ios" ? "white" : null}
                />
              </TouchableHighlight>

              <DateTimePicker
                isVisible={isDateTimePickerVisible}
                onConfirm={this._handleDatePicked}
                onCancel={this._hideDateTimePicker}
                mode="time"
              />
            </View>
          </View>

          <View
            style={{
              flexGrow: 1.5,
              flexDirection: "column",
              alignSelf: "center"
            }}
          >
            <TextInput
              style={{
                height: Convert(40),
                width: Convert(300),
                borderColor: "gray",
                borderWidth: 1,
                borderRadius: Convert(10),
                backgroundColor: "white",
                textAlign: "center",
                alignSelf: "center"
              }}
              onChangeText={(message) => this.setState({ message })}
              value={this.state.message}
              placeholder="Description"
              maxLength={30}
            />

            <View
              style={{
                display: "flex",
                flex: 0.4,
                flexDirection: "column",
                width: Convert(300)
              }}
            >
              <View>{this.snoozeModal()}</View>
            </View>
          </View>

          <View style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <TouchableHighlight
              style={{
                height: iphoneX ? Convert(80) : Convert(50),
                width: width,
                backgroundColor: Platform.OS === "ios" ? "dodgerblue" : null,
                margin: 0
              }}
            >
              <Button
                onPress={edit ? this._editAlarm : this._addAlarm}
                title="SAVE"
                accessibilityLabel="Save Alarm"
                color={Platform.OS === "ios" ? "white" : null}
              />
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  setting: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "lightgray",
    borderBottomWidth: 1,
    marginTop: Convert(10)
  },
  editButton: {
    height: 40,
    width: Convert(160),
    borderRadius: Convert(10),
    marginLeft: Convert(50),
    marginRight: Convert(50),
    marginTop: Convert(20),
    marginBottom: Convert(30),
    backgroundColor: Platform.OS === "ios" ? "dodgerblue" : null
  }
});

export default AddAlarm;
