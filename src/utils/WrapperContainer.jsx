import { StatusBar, StyleSheet } from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import Colors from './Colors';
import Loader from './Loader';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

const WrapperContainer = ({
  children,
  isLoading,
  backgroundColor,
  statusBarStyle,
}) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          styles.main,
          { backgroundColor: backgroundColor || Colors.white },
        ]}
      >
        <StatusBar
          barStyle={statusBarStyle || 'dark-content'}
          backgroundColor={backgroundColor || Colors.white}
        />
        <Loader isLoading={isLoading} />
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

WrapperContainer.propTypes = {
  children: PropTypes.node,
  isLoading: PropTypes.bool,
  backgroundColor: PropTypes.string,
  statusBarStyle: PropTypes.string,
};

WrapperContainer.defaultProps = {
  isLoading: false,
  backgroundColor: Colors.white,
  statusBarStyle: 'light-content',
};

export default WrapperContainer;

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});
