import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Colors from '../../components/Colors';
import {
  responsiveFontSize,
  responsivePadding,
} from '../../components/Responsive';
import {useNavigation} from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('');
  const payementType = [
    {name: 'Pay with QR Code', value: '1'},
    {name: 'Pay with VPA', value: '2'},
  ];

  return (
    <SafeAreaView style={styles.main}>
      <StatusBar barStyle={'dark-content'} backgroundColor={Colors.white} />
      <ScrollView style={{}}>
        <View style={{marginVertical: 5}}>
          <Text style={styles.headerText}>For Payment</Text>
        </View>
        {/* </View> */}
        {/* Show the dropDown with two option */}
        <View style={styles.viewHolder}>
          <SelectDropdown
            data={payementType}
            onSelect={(selectedItem, index) => {
              console.log(selectedItem.name, selectedItem.value);
              setSelectedOption(selectedItem.value);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.name;
            }}
            rowTextForSelection={(item, index) => {
              return item.name;
            }}
            buttonStyle={styles.dropdownButtonStyle}
            buttonTextStyle={styles.dropdownButtonTextStyle}
            dropdownStyle={styles.dropdownStyle}
            rowStyle={styles.dropdownRowStyle}
            rowTextStyle={styles.dropdownRowTextStyle}
          />
        </View>
        {selectedOption === '1' && (
          <View style={{alignSelf: 'center'}}>
            <Image
              source={require('../../assets/image/image.png')}
              style={{
                height: responsivePadding(250),
                width: responsivePadding(250),
              }}
            />
          </View>
        )}
        {selectedOption === '2' && (
          <View style={{alignSelf: 'center'}}>
            <Text style={styles.headerText}>premindustriesecom@hsbc</Text>
          </View>
        )}
        {/* Product Details  */}
        <View style={styles.productDetailsHolder}>
          <Text style={styles.label}>OrderId</Text>
          <TextInput
            editable={false}
            placeholder="PI - 57"
            placeholderTextColor={Colors.black}
            style={styles.textInput}
          />
        </View>
        <View style={styles.productDetailsHolder}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            editable={false}
            placeholder="Paper Bag Pb 3T"
            placeholderTextColor={Colors.black}
            style={styles.textInput}
          />
        </View>
        <View style={styles.productDetailsHolder}>
          <Text style={styles.label}>Shipping City</Text>
          <TextInput
            editable={false}
            placeholder="Patna"
            placeholderTextColor={Colors.black}
            style={styles.textInput}
          />
        </View>
        <View style={styles.productDetailsHolder}>
          <Text style={styles.label}>Total Order Value</Text>
          <TextInput
            editable={false}
            placeholder="Rs.7226"
            placeholderTextColor={Colors.black}
            style={styles.textInput}
          />
        </View>
        <View style={styles.productDetailsHolder}>
          <Text style={styles.label}>Enter UTR Number</Text>
          <TextInput
            placeholder="Enter UTR Number"
            placeholderTextColor={Colors.text_grey}
            style={styles.textInput}
          />
        </View>
        {/* Button Submit */}
        <TouchableOpacity style={styles.buttonView}>
          <Text style={styles.checkoutText}>Submit order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerText: {
    color: Colors.forgetPassword,
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  viewHolder: {
    marginVertical: responsivePadding(10),
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  dropdownButtonStyle: {
    width: '100%',
    height: responsivePadding(50),
    backgroundColor: Colors.forgetPassword,
    borderRadius: responsivePadding(8),
    borderWidth: responsivePadding(1),
    borderColor: Colors.white,
  },
  dropdownButtonTextStyle: {
    color: Colors.white,
    textAlign: 'left',
    fontSize: responsiveFontSize(16),
  },
  dropdownStyle: {
    backgroundColor: Colors.white,
    borderRadius: responsivePadding(8),
  },
  dropdownRowStyle: {
    backgroundColor: Colors.bottom,
    borderBottomColor: Colors.forgetPassword,
  },
  dropdownRowTextStyle: {
    color: Colors.black,
    textAlign: 'left',
    fontSize: responsiveFontSize(16),
  },
  productDetailsHolder: {
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
    gap: 5,
  },
  label: {
    fontSize: responsiveFontSize(22),
    color: Colors.black,
    fontWeight: 'bold',
  },
  textInput: {
    fontSize: responsiveFontSize(18),
    borderWidth: 2,
    fontWeight: 'bold',
    color: Colors.forgetPassword,
    borderRadius: 5,
    paddingLeft: 20,
  },
  buttonView: {
    borderWidth: responsivePadding(2),
    width: responsivePadding(343),
    marginVertical: responsivePadding(10),
    alignSelf: 'center',
    height: responsivePadding(48),
    borderRadius: responsivePadding(5),
    borderColor: Colors.forgetPassword,
    backgroundColor: Colors.forgetPassword,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: responsiveFontSize(18),
  },
});
