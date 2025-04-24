import {StyleSheet, Text, View, Pressable} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
    label: string;
    theme?: 'primary';
    onPress?: () => void;
}

export default function Button({ label, theme, onPress }: Props) {
    return(
        <View style={styles.buttonContainer}>
            <Pressable 
                style={[styles.button, theme === 'primary' && { backgroundColor: '#ffd33d' }]}
                onPress={onPress}>
            <Text style={styles.buttonLabel}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 320,
        height: 68,
        marginBottom: 20,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        borderWidth:4, 
        borderColor: '#ffd33d',
        borderRadius:18,
        backgroundColor: '#000000',
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonLabel: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonIcon: {
        paddingRight: 8,
    },
})