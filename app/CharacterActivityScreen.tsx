import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import ActivityModal from './SubmitActivityModal';
import { useCharacter } from '@/utils/CharacterContext';
import RaidModal from './SubmitRaidModal';
import { Feather } from '@expo/vector-icons';
import { fetchCharacterInfo } from '@/utils/FetchLostArkAPI';

const CharacterActivity: React.FC = () => {
  const params = useLocalSearchParams();
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const toggleActivityModal = () => setActivityModalVisible((prev) => !prev);
  const [activityIndex, setActivityIndex] = useState<number | null>(null);
  const [raidModalVisible, setRaidModalVisible] = useState(false);
  const [raidIndex, setRaidIndex] = useState<number>(0);
  const toggleRaidModal = () => setRaidModalVisible((prev) => !prev);
  const { id } = params;
  const { characters, updateCharacter, removeCharacter, refreshCharacter } =
    useCharacter();
  const character = characters.find((c) => c.id === id);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshText, setRefreshText] = useState('갱신하기');

  if (!character) return null; // ✅ 없는 캐릭터 방지

  const handleSelectStage = (index: number, stageIndex: number) => {
    const selectedRaid = character.SelectedRaids?.[index];
    if (!selectedRaid) return;

    const isSameAsLastCleared =
      selectedRaid.stages.findLast((s) => s.cleared)?.stage === stageIndex + 1;

    const updatedStages = selectedRaid.stages.map((stage, i) => ({
      ...stage,
      cleared: isSameAsLastCleared ? false : i <= stageIndex,
    }));

    const updatedRaids = [...(character.SelectedRaids || [])];
    updatedRaids[index] = {
      ...selectedRaid,
      stages: updatedStages,
      cleared: updatedStages.every((s) => s.cleared),
    };

    const updatedClearedRaidTotalGold =
      updatedRaids.reduce((total, raid) => {
        return (
          total +
          raid.stages.reduce((stageSum, stage) => {
            return stage.cleared ? stageSum + stage.gold : stageSum;
          }, 0)
        );
      }, 0) || 0;

    const updatedSelectedRaidTotalGold =
      updatedRaids.reduce((sum, raid) => sum + raid.totalGold, 0) || 0;

    updateCharacter(character.id, {
      SelectedRaids: updatedRaids,
      SelectedRaidTotalGold: updatedSelectedRaidTotalGold,
      ClearedRaidTotalGold: updatedClearedRaidTotalGold,
    });
  };

  const handleRemoveCharacter = () => {
    Alert.alert('캐릭터 삭제', '정말 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: () => {
          removeCharacter(character.id);
          router.replace('/MainPage'); // 홈으로 이동
        },
      },
    ]);
  };

  const handleRefreshCharacter = async () => {
    if (isRefreshing) return; // 이미 갱신 중이면 무시

    setIsRefreshing(true);
    setRefreshText('갱신완료');

    const data = await fetchCharacterInfo(character.CharacterName);
    if (data) {
      refreshCharacter(character.id, {
        CharacterImage: data.CharacterImage,
        CharacterClassName: data.CharacterClassName,
        ItemAvgLevel: data.ItemAvgLevel,
        ServerName: data.ServerName,
      });
    } else {
      Alert.alert('오류', '캐릭터 정보를 찾을 수 없습니다.');
    }

    // 10초 후 다시 활성화
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshText('갱신하기');
    }, 10000);
  };

  return (
    <View style={styles.container}>
      {/* 캐릭터 카드 */}
      <View style={styles.characterCard}>
        {/* 삭제 버튼 - 우측 상단 휴지통 아이콘 */}
        <Pressable style={styles.deleteButton} onPress={handleRemoveCharacter}>
          <Feather name="trash-2" size={20} color="white" />
        </Pressable>
        <View style={{ padding: 10 }}>
          {character.CharacterPortraitImage ? (
            <Image
              source={{
                uri:
                  character.CharacterPortraitImage +
                  `?d=${character.lastUpdated}`,
              }}
              style={{
                width: 150,
                height: 150,
                borderRadius: 12,
                borderWidth: 1,
              }}
              resizeMode="contain"
            />
          ) : (
            <Text>이미지를 찾을 수 없습니다</Text>
          )}
        </View>
        <Text style={styles.characterName}>{character.CharacterName}</Text>
        <Text style={styles.characterInfo}>
          {character.CharacterClassName} @ {character.ServerName}
        </Text>
        <Text style={styles.characterInfo}>Lv. {character.ItemAvgLevel}</Text>

        {/* 갱신 버튼 - 우측 하단 */}
        <Pressable
          style={styles.refreshButton}
          onPress={handleRefreshCharacter}
        >
          <Text style={styles.refreshButtonText}>{refreshText}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 주간 레이드 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🛡️ 주간 레이드</Text>
            <Text style={styles.totalGoldText}>
              {character.ClearedRaidTotalGold?.toLocaleString() || 0} /{' '}
              {character.SelectedRaidTotalGold?.toLocaleString() || 0} G
            </Text>
          </View>
          {[0, 1, 2].map((index) => (
            <View key={index}>
              <Text>{character.SelectedRaids?.[index]?.name || ''}</Text>
              <Text>{character.SelectedRaids?.[index]?.totalGold || ''}</Text>
              <View style={styles.raidRow}>
                {character.SelectedRaids?.[index]?.name ? (
                  character.SelectedRaids?.[index]?.stages.map(
                    (stage, stageIndex) => (
                      <Pressable
                        style={[
                          styles.raidButton,
                          stage.cleared ? { backgroundColor: '#ff7675' } : {},
                        ]}
                        key={stageIndex}
                        onPress={() => handleSelectStage(index, stageIndex)}
                      >
                        <Text style={styles.raidButtonText}>
                          {stage.difficulty}
                        </Text>
                        <Text style={styles.raidButtonText}>
                          {stage.stage} 관문
                        </Text>
                      </Pressable>
                    )
                  )
                ) : (
                  <Pressable style={styles.raidButton}>
                    <Text style={styles.raidButtonText}>
                      {`레이드 ${index + 1}`}
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  style={styles.editButton}
                  onPress={() => {
                    toggleRaidModal();
                    setRaidIndex(index);
                  }}
                >
                  <Text style={styles.editButtonText}>수정</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* 주간 활동 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎮 추가 수입</Text>
            <Text style={styles.totalGoldText}>
              {character.WeeklyActivityTotalGold || 0} G
            </Text>
          </View>
          {/* 추가 버튼 */}
          <View style={styles.addButtonContainer}>
            <Pressable style={styles.addButton} onPress={toggleActivityModal}>
              <Text style={styles.addButtonText}>＋ 추가</Text>
            </Pressable>
          </View>
          {Array.isArray(character.WeeklyActivity) &&
            character.WeeklyActivity.map((activity, index) => (
              <Pressable
                key={index}
                style={styles.raidButton}
                onPress={() => {
                  setActivityIndex(index);
                  toggleActivityModal();
                }}
              >
                <Text style={styles.raidButtonText}>{activity.name}</Text>
                <Text style={styles.raidButtonText}>{activity.gold} G</Text>
              </Pressable>
            ))}
        </View>
      </ScrollView>

      <ActivityModal
        isVisible={activityModalVisible}
        setIndexNull={() => setActivityIndex(null)}
        setIsVisibleFalse={() => setActivityModalVisible(false)}
        id={character.id}
        mode={activityIndex !== null ? 'edit' : 'add'}
        index={activityIndex ?? undefined}
        initialActivity={
          activityIndex !== null
            ? character.WeeklyActivity?.[activityIndex]
            : undefined
        }
      />

      <RaidModal
        isVisible={raidModalVisible}
        setIsVisibleFalse={() => setRaidModalVisible(false)}
        id={character.id}
        index={raidIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  characterCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  characterInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#444',
  },
  raidButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  raidButtonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  addButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  addButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalGoldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  raidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  editButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  editButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },

  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },

  refreshButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25, // 타원형 느낌
    alignItems: 'center',
  },

  refreshButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CharacterActivity;
