import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Map from "@/components/Map";
import { icons } from "@/constants";

// Lấy chiều cao màn hình điện thoại
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Cài đặt 2 điểm dừng (Snap Points) y hệt như cấu hình cũ ["40%", "85%"]
const SNAP_TOP = SCREEN_HEIGHT * 0.15; // Cách đỉnh 15% (Nghĩa là mở rộng 85%)
const SNAP_BOTTOM = SCREEN_HEIGHT * 0.6; // Cách đỉnh 60% (Nghĩa là chỉ hiển thị 40% ở đáy)

const RideLayout = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  // Biến Animated lưu trữ vị trí dọc (Y) của Bottom Sheet
  const translateY = useRef(new Animated.Value(SNAP_BOTTOM)).current;

  // Cấu hình nhận diện vuốt tay
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Chỉ kích hoạt khi người dùng vuốt dọc (tránh nhầm với vuốt ngang)
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        // Khi bắt đầu chạm tay vào, lưu lại vị trí hiện hành
        translateY.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dy: translateY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        // Khi thả tay ra, gộp tọa độ lại
        translateY.flattenOffset();

        // Logic tự động hút (snap) lên trên hoặc xuống dưới dựa vào chiều vuốt
        if (gestureState.dy < 0 || gestureState.vy < -0.5) {
          // Vuốt lên -> Mở bung Sheet ra (85%)
          Animated.spring(translateY, {
            toValue: SNAP_TOP,
            useNativeDriver: false,
            bounciness: 4, // Độ nảy nhẹ khi dừng lại
          }).start();
        } else if (gestureState.dy > 0 || gestureState.vy > 0.5) {
          // Vuốt xuống -> Thu nhỏ Sheet lại (40%)
          Animated.spring(translateY, {
            toValue: SNAP_BOTTOM,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        {/* KHU VỰC BẢN ĐỒ CỐ ĐỊNH */}
        <View className="flex flex-col h-screen bg-blue-500">
          <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Image
                  source={icons.backArrow}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </View>
            </TouchableOpacity>
            <Text className="text-xl font-JakartaSemiBold ml-5">
              {title || "Go Back"}
            </Text>
          </View>

          <Map />
        </View>

        {/* CUSTOM DRAGGABLE BOTTOM SHEET */}
        <Animated.View
          className="absolute left-0 right-0 bg-white rounded-t-3xl shadow-lg border-t border-gray-200"
          style={{
            height: SCREEN_HEIGHT, // Cấp chiều cao bằng màn hình để không bị rỗng đáy khi vuốt lên
            transform: [{ translateY: translateY }],
            // Thêm bóng đổ tạo cảm giác nổi lên trên bản đồ
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          {/* KHU VỰC NHẬN DIỆN VUỐT TAY (DRAG HANDLE) */}
          <View
            {...panResponder.panHandlers}
            className="w-full items-center py-4 bg-transparent z-20"
          >
            {/* Thanh gạt ngang giả */}
            <View className="w-16 h-1.5 bg-gray-300 rounded-full" />
          </View>

          {/* NỘI DUNG BÊN TRONG BẢNG ĐIỀU KHIỂN */}
          <View className="flex-1 px-5">{children}</View>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
};

export default RideLayout;
