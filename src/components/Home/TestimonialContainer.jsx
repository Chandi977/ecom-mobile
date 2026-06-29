import React, { useEffect, useRef, useState, useCallback } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import Data from "../../assets/data/testimonials.json";
import FontFamily from "../../utils/FontFamily";
import Colors from "../../utils/Colors";
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  textScale,
} from "../../utils/responsiveSize";

const { width: screenWidth } = Dimensions.get("window");

const TestimonialContainer = () => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState([...Data]);

  const scrollToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % data.length;
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: nextIndex * screenWidth,
          animated: true,
        });
      }

      if (nextIndex === data.length - 1) {
        const nextItem = Data[data.length % Data.length];
        const newData = [...data, nextItem];

        if (newData.length >= Data.length * 2) {
          setData([...Data]);
          scrollViewRef.current.scrollTo({ x: 0, animated: false }); // Reset scroll position
          return 0;
        } else {
          setData(newData);
        }
      }

      return nextIndex;
    });
  }, [data]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / screenWidth);

    if (newIndex === data.length - 1) {
      const nextItem = Data[data.length % Data.length];
      const newData = [...data, nextItem];

      if (newData.length >= Data.length * 2) {
        setData([...Data]);
        scrollViewRef.current.scrollTo({ x: 0, animated: false });
      } else {
        setData(newData);
      }
    }
  };

  useEffect(() => {
    const intervalId = setInterval(scrollToNext, 2000);
    return () => clearInterval(intervalId);
  }, [scrollToNext]);

  return (
    <View
      style={{
        marginVertical: 10,
        backgroundColor: Colors.back,
      }}
    >
      <Text style={styles.headerText}>Testimonial</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {data.map((item, index) => (
          <View
            style={[styles.pageWrapper, { width: screenWidth }]}
            key={index}
          >
            <View style={styles.itemHolder}>
              <Text style={styles.nameText}>{item?.name}</Text>
              <Text style={styles.descriptionText}>{item?.feedback}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TestimonialContainer;

const styles = StyleSheet.create({
  main: {
    backgroundColor: "white",
    alignSelf: "center",
  },
  headerText: {
    color: Colors.brandColor,
    fontSize: textScale(16),
    textTransform: "uppercase",
    textAlign: "center",
    fontFamily:FontFamily.Montserrat_SemiBold,
    padding: moderateScale(10),
    marginBottom: moderateVerticalScale(15),
  },
  pageWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemHolder: {
    borderWidth: moderateScale(2),
    gap: moderateScale(10),
    padding: moderateScale(15),
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: moderateScale(10),
    elevation: moderateScale(10),
    borderColor: "white",
    shadowRadius: moderateScale(3),
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    width: screenWidth - moderateScale(30),
    marginVertical: moderateVerticalScale(10),
  },
  nameText: {
    fontFamily: FontFamily?.Montserrat_SemiBold,
    fontSize: textScale(18),
    color: Colors.brandColor,
    textAlign: "center",
    lineHeight: scale(24),
    textTransform: "capitalize",
  },
  descriptionText: {
    fontFamily: FontFamily.Montserrat_Medium,
    color: Colors.black,
    fontSize: textScale(12),
    textAlign: "center",
    lineHeight: scale(24),
  },
});
