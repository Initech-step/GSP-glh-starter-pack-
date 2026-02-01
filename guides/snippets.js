{/* Completion Badge - shows when user reaches 95% */}
          {/* {hasReached95Percent && (
            <View style={styles.completionBadge}>
              <FontAwesome name="check-circle" size={14} color="#22c55e" />
              <Text style={styles.completionText}>Completed</Text>
            </View>
          )} */}



  // ============================================
  // PAN RESPONDER FOR DRAGGABLE PROGRESS BAR
  // Allows user to drag the progress thumb to seek
  // ============================================
  // const panResponder = useRef(
  //   PanResponder.create({
  //     onStartShouldSetPanResponder: () => true,
  //     onMoveShouldSetPanResponder: () => true,
      
  //     onPanResponderGrant: (evt) => {
  //       // User started touching the progress bar
  //       setIsDragging(true);
        
  //       // Calculate initial position from touch
  //       const touchX = evt.nativeEvent.locationX;
  //       const newPosition = Math.max(0, Math.min(touchX, progressBarWidth));
  //       setDragPosition(newPosition);
  //     },
      
  //     onPanResponderMove: (evt, gestureState) => {
  //       // User is dragging - update drag position
  //       const newPosition = Math.max(0, Math.min(gestureState.moveX - 20, progressBarWidth));
  //       setDragPosition(newPosition);
  //     },
      
  //     onPanResponderRelease: (evt, gestureState) => {
  //       // User released finger - seek to new position
  //       setIsDragging(false);
        
  //       if (!duration) return;
        
  //       // Calculate percentage based on drag position
  //       const touchX = Math.max(0, Math.min(gestureState.moveX - 20, progressBarWidth));
  //       const percentage = touchX / progressBarWidth;
        
  //       // Calculate new time in seconds
  //       const newTime = percentage * duration;
        
  //       console.log(`⏩ Seeking to ${newTime.toFixed(2)}s (${(percentage * 100).toFixed(1)}%)`);
        
  //       // Seek to new position using AudioContext
  //       seekTo(newTime);
  //     },
  //   })
  // ).current;


  // ============================================
  // CALCULATE PROGRESS
  // Shows either actual progress or drag preview
  // ============================================
  // const progressPercentage = duration > 0 ? ((position || 0) / duration) * 100 : 0;
  // const displayPercentage = isDragging 
  //   ? (dragPosition / progressBarWidth) * 100 
  //   : progressPercentage;


      {/* ============================================
            PROGRESS SECTION
            ============================================ */}
        {/* <View style={styles.progressSection}>
          <View 
            style={styles.progressBarContainer}
            {...panResponder.panHandlers}
          >
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${displayPercentage}%` }
                ]}
              />
              <View
                style={[
                  styles.progressThumb,
                  isDragging && styles.progressThumbActive,
                  { left: `${displayPercentage}%` }
                ]}
              />
            </View>
          </View> 

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>
              {formatTime(isDragging ? (dragPosition / progressBarWidth) * duration : position)}
            </Text>
            <Text style={styles.progressText}>
              {displayPercentage.toFixed(1)}%
            </Text>
            <Text style={styles.timeText}>
              {formatTime(duration)}
            </Text>
          </View> 
        </View> */}


{/* ============================================
            DEBUG INFO
            Useful for development - remove in production
            ============================================ */}
        {/* {__DEV__ && (
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>Debug Status:</Text>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Progress:</Text>
              <Text style={styles.debugValue}>
                {progressPercentage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Completed:</Text>
              <Text style={styles.debugValue}>
                {hasReached95Percent ? '✅ Yes' : '❌ Not yet'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Playing:</Text>
              <Text style={styles.debugValue}>
                {isPlaying ? '▶️ Yes' : '⏸️ No'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Loaded:</Text>
              <Text style={styles.debugValue}>
                {isLoaded ? '✅ Yes' : '❌ No'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Loading:</Text>
              <Text style={styles.debugValue}>
                {isLoading ? '⏳ Yes' : '✅ No'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Dragging:</Text>
              <Text style={styles.debugValue}>
                {isDragging ? '👆 Yes' : '❌ No'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Position:</Text>
              <Text style={styles.debugValue}>
                {position.toFixed(2)}s / {duration.toFixed(2)}s
              </Text>
            </View>
          </View>
        )} */}
