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
  titleText,
  messageText,
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
          style={[
            styles.container,
            { backgroundColor: colors.alertBackground },
          ]}
          onPress={() => {}}
        >
          <CustomText style={[styles.titleText, { color: colors.black }]}>
            {titleText}
          </CustomText>
          {messageText && (
            <CustomText style={[styles.messageText, { color: colors.black }]}>
              {messageText}
            </CustomText>
          )}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.button} onPress={handleClose}>
              <CustomText
                style={[styles.buttonText, { color: colors.secondary }]}
              >
                닫기
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
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
    lineHeight: 20,
  },
  buttonWrapper: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 80,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;
