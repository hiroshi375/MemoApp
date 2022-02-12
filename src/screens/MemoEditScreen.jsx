import React, { useState } from 'react';
import {
  View, TextInput, StyleSheet, Alert,
} from 'react-native';
import { shape, string } from 'prop-types';
import firebase from 'firebase';

import CircleButton from '../components/CircleButton';
import KeyboardSafeView from '../components/KeyboardSafeView';
import { translateErrors } from '../utils';

export default function MemoEditScreen(props) {
  const { navigation, route } = props;
  // bodyText：MemoDetailScreenから渡ってきたテキスト
  const { id, bodyText } = route.params;
  // 初期値としてbodyTextを設定する
  // setBody関数で値を変更できる
  // body：MemoEditScreenの中で編集するテキスト
  const [body, setBody] = useState(bodyText);

  function handlePress() {
    const { currentUser } = firebase.auth();
    if (currentUser) {
      const db = firebase.firestore();
      // .doc 単一ドキュメントへの参照
      const ref = db.collection(`users/${currentUser.uid}/memos`).doc(id);
      // データ更新メソッド(.set())
      ref.set({
        bodyText: body,
        updatedAt: new Date(),
      }, { merge: true })
      // set()が成功した時に行うこと
        .then(() => {
          // 前の画面に戻る
          navigation.goBack();
        })
      // set()が失敗した時に行うこと
        .catch((error) => {
          const errorMsg = translateErrors(error.code);
          Alert.alert(errorMsg.title, errorMsg.description);
        });
    }
  }

  return (
    <KeyboardSafeView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            value={body}
            multiline
            style={styles.input}
            onChangeText={(text) => { setBody(text); }}
          />
        </View>
        <CircleButton
          name="check"
          onPress={handlePress}
        />
      </View>
    </KeyboardSafeView>
  );
}

MemoEditScreen.propTypes = {
  route: shape({
    params: shape({ id: string, bodyText: string }),
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 27,
    paddingVertical: 32,
    flex: 1,
  },
  input: {
    flex: 1,
    textAlignVertical: 'top',
    fontSize: 20,
    lineHeight: 24,
  },
});
