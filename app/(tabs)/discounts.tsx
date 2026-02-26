import { Text, View, StyleSheet, ScrollView, Pressable} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

export default function DiscountsScreen(){
    // database
    const database = useSQLiteContext();


    const createDiscount = async () => {
        // not implemented yet
    }

    const deleteDiscount = async () => {
        // not implemented yet
    }

    const updateDiscount = async () => {
        // not implemented yet
    }





    // Screen Layout
    return(
            <View style={styles.container}>
                <Text style={styles.text}>This is the Discounts Screen</Text>
            </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text:{
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
})