import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import firebase from 'firebase';

import MemoList from '../components/MemoList';
import CircleButton from '../components/CircleButton';
import LogOutButton from '../components/LogOutButton';

export default function MemoListScreen(props) {
  const { navigation } = props;
  const [memos, setMemos] = useState([]);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <LogOutButton />,
    });
  }, []);

  useEffect(() => {
    const db = firebase.firestore();
    const { currentUser } = firebase.auth();
    // letは再代入可能な変数の宣言（letはなるべく使わないようにする）
    // 何も処理しないアロー関数
    let unsubscribe = () => {};
    if (currentUser) {
      const ref = db.collection(`users/${currentUser.uid}/memos`).orderBy('updatedAt', 'desc');
      // 監視キャンセルのためのunsubscribe変数の設定
      unsubscribe = ref.onSnapshot((snapshot) => {
        // 値を取得するための仮の配列
        const userMemos = [];
        snapshot.forEach((doc) => {
          console.log(doc.id, doc.data());
          const data = doc.data();
          userMemos.push({
            id: doc.id,
            bodyText: data.bodyText,
            updatedAt: data.updatedAt.toDate(),
          });
          setMemos(userMemos);
        });
      }, (error) => {
        console.log(error);
        Alert.alert('データの読み込みに失敗しました。');
      });
    }
    return unsubscribe; // アンマウントの瞬間にunsubscribeが実行され監視がキャンセルされる
  }, []); // 一度だけ監視させ、表示させる

  // MemoListのpropsにmemosを渡す
  return (
    <View style={styles.container}>
      <MemoList memos={memos} />
      <CircleButton
        name="plus"
        onPress={() => { navigation.navigate('MemoCreate'); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
});
