import React from 'react';
import { Portal, Modal } from 'react-native-paper';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
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
  onSubmit,
}) => {
  const { colors } = useTheme();

  const handleSubmit = () => {
    onSubmit?.();
    setIsVisibleFalse();
  };

  const handleClose = () => {
    setIsVisibleFalse();
  };

  return (
    <Portal>
      <Modal
        visible={isVisible}
        onDismiss={handleClose} // 모달 외부 터치 시 닫기
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
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
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 280,
    alignSelf: 'center',
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
