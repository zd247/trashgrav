package rattclub.gravtrash.welcome

import android.content.Context
import android.content.SharedPreferences

class LauncherManager (
    val sharedPreferences: SharedPreferences,
    val editor: SharedPreferences.Editor) {


    constructor(context: Context) : this(
        sharedPreferences = context.getSharedPreferences(PREF_NAME, 0),
        editor = context.getSharedPreferences(PREF_NAME, 0).edit()
    )

    fun setFirstLaunch(isFirst: Boolean) {
        editor.putBoolean(IS_FIRST_TIME, isFirst)
        editor.commit()
    }

    fun isFirstTime(): Boolean {
        return sharedPreferences.getBoolean(IS_FIRST_TIME, true)
    }





    companion object{
        const val PREF_NAME = "LauncherManager"
        const val IS_FIRST_TIME = "isFirst"
    }


}