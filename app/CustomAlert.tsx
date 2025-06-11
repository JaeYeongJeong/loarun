import React from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  Modal,
} from 'react-native';
import CustomText from './components/CustomText';
import { useTheme } from '@/context/ThemeContext';

type CustomAlertProps = {
  isVisible: boolean;
  setIsVisibleFalse: () => void;
  titleText?: string;
  messageText?: string;
  onSubmit?: () => void;
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  isVisible,
  setIsVisibleFalse,
  titleText = '제목',
  messageText = '메세지',
  onSubmit: submitAction,
}) => {
  const { colors } = useTheme();

  const handleSubmit = () => {
    submitAction?.();
    setIsVisibleFalse();
  };

  const handleClose = () => {
    setIsVisibleFalse();
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={isVisible}
      presentationStyle="overFullScreen"
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.container, { backgroundColor: colors.background }]}
          onPress={() => {}}
        >
          <CustomText style={[styles.titleText, { color: colors.black }]}>
            {titleText}
          </CustomText>
          <CustomText style={[styles.messageText, { color: colors.black }]}>
            {messageText}
          </CustomText>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity onPress={handleClose}>
              <CustomText
                style={[styles.buttonText, { color: colors.secondary }]}
              >
                닫기
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit}>
              <CustomText
                style={[styles.buttonText, { color: colors.secondary }]}
              >
                확인
              </CustomText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 280,
    padding: 20,
    borderRadius: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',

    marginBottom: 10,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;
