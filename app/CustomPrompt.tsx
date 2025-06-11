import React, { useState } from 'react';
import {
  StyleSheet,
  Modal,
  View,
  TextInput,
  Button,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import CustomText from './components/CustomText';
import { useTheme } from '@/context/ThemeContext';

type CustomPromptProps = {
  isVisible: boolean;
  setIsVisibleFalse: () => void;
  titleText?: string;
  messageText?: string;
  onSubmit?: (input: string) => void;
};

const CustomPrompt: React.FC<CustomPromptProps> = ({
  isVisible,
  setIsVisibleFalse,
  titleText = '제목',
  messageText = '메세지',
  onSubmit: submitAction,
}) => {
  const { colors } = useTheme();
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    submitAction?.(input);
    setInput('');
    setIsVisibleFalse();
  };

  const handleClose = () => {
    setInput('');
    setIsVisibleFalse();
  };

  return (
    <Modal animationType="none" transparent visible={isVisible}>
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
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="닉네임 입력"
            style={[
              styles.input,
              { color: colors.black, backgroundColor: colors.grayLight },
            ]}
          />
          <View style={styles.buttonWrapper}>
            <TouchableOpacity>
              <CustomText
                style={[styles.buttonText, { color: colors.secondary }]}
              >
                닫기
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity>
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
  input: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 16,
    textAlignVertical: 'center',
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomPrompt;
